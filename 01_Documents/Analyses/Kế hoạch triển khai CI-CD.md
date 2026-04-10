Kế hoạch triển khai CI/CD — Chi tiết từng bước

Mục tiêu

- Xây dựng pipeline CI/CD tự động để: build, test, tạo artifact (Docker image), và triển khai lên staging/production với rollback và monitoring.

Tiền đề và giả định

- Repository chứa `backend/` (NestJS) và `frontend/` (ReactJS) hoặc cấu trúc tương đương; mã tách rõ ràng.
- Bạn có quyền quản trị repository và quyền cấu hình secrets trên nền tảng CI/CD (GitHub, GitLab, etc.).
- Có registry (Docker Hub / GitHub Container Registry / private registry). Triển khai **chỉ dùng Docker + Docker Compose cho hạ tầng phụ trợ** (DB, ElasticSearch, Keycloak); frontend và backend sẽ chạy trực tiếp trên host bằng `npm`/Node (không containerize).

Tổng quan các bước

1. Đánh giá repository (1–2 giờ)

- Kiểm tra: cấu trúc thư mục (`backend/`, `frontend/`), build commands cụ thể cho NestJS (`backend/`: `npm ci && npm run build`) và ReactJS (`frontend/`: `npm ci && npm run build`), test commands (`npm test`), và `Dockerfile` cho mỗi service.
- Ghi lại: ports, env vars per-service, scripts để build/test, và list các secrets cần lưu.

2. Chọn nền tảng CI/CD (30 phút)

- GitHub Actions:
  - Ưu độc nhất: tích hợp native với giao diện PR/checks của GitHub (kết quả CI hiển thị trực tiếp trên pull requests của GitHub).
  - Khuyết độc nhất: giới hạn tài nguyên hosted (concurrency/minutes) áp dụng trực tiếp cho repo-hosted runners (khó giải quyết mà không dùng self-hosted runners).

- GitLab CI:
  - Ưu độc nhất: CI + container registry tích hợp trong cùng một sản phẩm (đặt toàn bộ workflow, registry, và permissions trong GitLab).
  - Khuyết độc nhất: nếu muốn tài nguyên không giới hạn bạn phải self-host và chịu overhead vận hành cho runners/registry.

- Jenkins:
  - Ưu độc nhất: hệ sinh thái plugin cực kỳ phong phú cho mọi tích hợp on-prem/custom (khả năng tùy biến sâu nhất trong số các nền tảng).
  - Khuyết độc nhất: chi phí vận hành (bảo trì, cập nhật, quản trị plugin) là bắt buộc; không có hosted managed experience bản địa.

- CircleCI:
  - Ưu độc nhất: tối ưu hoá cho build performance và advanced caching/parallelism (tối ưu tốc độ build trên cấu hình cloud của CircleCI).
  - Khuyết độc nhất: khi scale, chi phí và gói tính năng có thể khiến bạn phải trả nhiều hơn so với các giải pháp tích hợp sẵn.

- Azure DevOps (Pipelines):
  - Ưu độc nhất: tích hợp sâu với Azure services (Boards/Artifacts/Subscriptions) khiến workflow enterprise trên Azure rất mượt mà.
  - Khuyết độc nhất: dễ bị lệ thuộc vào ecosystem Azure nếu bạn tận dụng toàn bộ tính năng (vendor lock-in về tooling và dịch vụ).

- Lựa chọn hướng dẫn:
  - Chọn nền tảng dựa trên điểm độc nhất nêu trên và nhu cầu của team (ví dụ: nếu cần hiển thị CI trực tiếp trên PR GitHub thì ưu GitHub Actions; nếu cần tích hợp registry và CI trong cùng hệ thống thì ưu GitLab; nếu cần tùy biến on-prem sâu nhất thì Jenkins; nếu ưu tốc độ build cloud là trọng tâm thì CircleCI; nếu hạ tầng chính là Azure thì Azure DevOps).

    -> Lựa chọn GitHub Actions cho hướng dẫn này vì tích hợp native với GitHub.

3. Xác định môi trường triển khai (30 phút)

- Staging: mirror production ở mức cần thiết.
- Production: xác định strategy (blue/green, canary, rolling).
- Registry: Docker Hub / GHCR / private registry (cần credentials).
  -> Hiện chỉ cần quan tâm đến môi trường staging để đảm bảo pipeline hoạt động trước khi triển khai production.

4. Thiết kế CI/CD (tự động với GitHub Actions, deploy cục bộ) (1–2 giờ)

- Giải thích: "pipeline" ở đây gồm 2 phần rõ ràng:
  - CI: build + lint + unit tests + publish artifacts (chạy trên GitHub-hosted runner).
  - CD: deploy lên môi trường Staging tự động (chạy trên self-hosted runner đặt trên máy local của bạn) — vì bạn muốn deploy cục bộ.

- Yêu cầu trước khi tự động CD:
  - Cài đặt một GitHub self-hosted runner trên máy local (máy dev/QA) và gán label ví dụ `staging-runner`.
  - Nếu infra images private: tạo `REGISTRY_USER`/`REGISTRY_TOKEN` trong `Secrets`.

- Triggers đề xuất:
  - Tự động deploy: `push` vào `main` (hoặc tag `v*`).
  - Manual deploy: workflow_dispatch (cho phép trigger thủ công từ GitHub).

- Workflow cao cấp (ý tưởng): hai job chính
  1. `ci` (runs-on: `ubuntu-latest`): checkout → setup node → install → lint → test → build artifacts → `upload-artifact`.
  2. `deploy-staging` (runs-on: `self-hosted && Windows && staging-runner`): `needs: ci` → `download-artifact` → chạy các file `docker-compose.*.yml` có sẵn để khởi infra (`docker compose -f <file> up -d`) → copy/replace `backend/dist` và `frontend/build` trên local host → khởi/restart ứng dụng bằng `npm` (khởi tiến trình nền trên Windows) — không dùng `pm2`/`systemd`/`nginx` ở đây.

- Lợi ích của self-hosted runner local:
  - GitHub Actions vẫn quản lý CI, nhưng CD thực thi trực tiếp trên máy bạn (không cần SSH từ runner trung gian).
  - Tự động, repeatable, và có logs ngay trong Actions UI.

- Ví dụ tóm tắt workflow YAML (đoạn ngắn, ý tưởng):

```yaml
name: CI/CD Staging
on:
  push:
    branches: [main]
  workflow_dispatch: {}

  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: Install & Build Backend
        run: |
          cd backend && npm ci && npm run build
      - name: Install & Build Frontend
        run: |
          cd frontend && npm ci && npm run build
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: staging-artifacts
          path: |
            backend/dist
            frontend/build

  deploy-staging:
    needs: ci
    runs-on: [self-hosted, Windows, staging-runner]
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: staging-artifacts

      - name: Start infra (all docker-compose.*.yml files)
        shell: pwsh
        run: |
          Get-ChildItem -Path ${{ github.workspace }} -Filter 'docker-compose.*.yml' -Recurse | ForEach-Object {
            $f = $_.FullName
            docker compose -f $f pull
            docker compose -f $f up -d
          }

      - name: Deploy backend locally (copy artifacts & start with npm)
        shell: pwsh
        run: |
          $target = 'C:\srv\backend'
          if (Test-Path "$target\dist") { Remove-Item -Recurse -Force "$target\dist" }
          Move-Item -Path "$PWD\backend\dist" -Destination "$target\dist"
          Set-Location $target
          npm ci
          Start-Process -FilePath 'node' -ArgumentList 'dist/main.js' -WindowStyle Hidden

      - name: Deploy frontend locally (copy build & start with npx serve)
        shell: pwsh
        run: |
          $target = 'C:\var\www\myapp'
          if (Test-Path $target) { Remove-Item -Recurse -Force $target }
          Move-Item -Path "$PWD\frontend\build" -Destination $target
          Set-Location $target
          Start-Process -FilePath 'npx' -ArgumentList 'serve -s . -l 3000' -WindowStyle Hidden
```

- Các bước tiếp theo cho CI/CD (sau khi đã có workflow YAML) — phiên bản rút gọn

1. Thiết lập self-hosted runner (CI → CD link):
   - Cài GitHub Actions runner trên máy local/QA, đăng ký runner vào repo/org, gán label `staging-runner` và khởi động như service.
   - Kiểm tra runner có quyền chạy Docker, Docker Compose, `pm2` (nếu dùng), và có đủ quyền file-system để ghi đường dẫn deploy (`/srv/backend`, `/var/www/myapp`).

2. Cấu hình Secrets & permissions (GitHub Secrets):
   - Thêm `REGISTRY_USER` / `REGISTRY_TOKEN` (nếu cần), `NPM_TOKEN` (nếu private packages), và biến môi trường deploy path/owner nếu workflow cần.
   - Kiểm tra `GITHUB_TOKEN` scope cho job `deploy-staging` và bật `permissions: contents: write` nếu workflow cần push/releases.

3. Reuse existing `docker-compose.*.yml` (không cần tạo mới):
   - Không cần tạo `docker-compose.staging.yml` nếu bạn đã có file `docker-compose.*.yml` phù hợp; chỉ đảm bảo runner biết đường dẫn và service names.
   - Bảo đảm runner có Docker Compose (v2+) và có quyền pull images.

4. Branch protection & required checks:
   - Bật required status checks trên `main` (ví dụ: `ci` job success) để ngăn merge khi CI fail.
   - Cho phép `workflow_dispatch` cho deploy manual nếu cần.

5. Caching, speedups và matrix build (tùy chọn):
   - Thêm `actions/cache` cho `~/.npm` và node_modules giữa runs để giảm thời gian.
   - Sử dụng matrix jobs nếu cần test trên nhiều Node versions hoặc cấu hình.

6. Notifications & observability cho CI/CD (tùy chọn):
   - Thêm webhook/Slack/Teams notification action cho success/failure.
   - Lưu logs build/deploy (Action logs + runner logs) theo retention policy.

- Ghi chú ngắn an toàn:
- Self-hosted runner cần được đặt trong mạng an toàn; runner có quyền thực thi lệnh trên máy local nên giữ token/runner private.
- Secrets lưu trên GitHub Secrets; không in ra logs.

- Ghi chú: tôi đã tạm bỏ các bước `smoke-tests`, `artifact retention`, `rollback`, `security hardening` và `dry-run/validation` theo yêu cầu để đơn giản hoá; có thể thêm lại sau khi bạn muốn.

5. Secrets và credentials (chỉ Staging) (15–30 phút)

- Cần ít nhất: nếu dùng private images cho infra thì cần registry credentials (`REGISTRY_USER`, `REGISTRY_TOKEN`). Không cần SSH keys vì deploy sẽ thực hiện cục bộ (local).
- Lưu secrets ở GitHub Secrets (hoặc secrets của CI provider) nếu cần cho build hoặc pull private images; giữ credentials an toàn.
