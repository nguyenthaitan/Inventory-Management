import React, { useState, useEffect } from 'react';
import './QCTestList.css';

const API_BASE_URL = 'http://localhost:3000';

const QCTestList = () => {
  const [qcTests, setQcTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analyses, setAnalyses] = useState({});

  // Load mock data khi component mount
  useEffect(() => {
    fetchMockData();
  }, []);

  const fetchMockData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/mock-data`);
      const result = await response.json();
      
      if (result.success) {
        setQcTests(result.data);
      }
    } catch (error) {
      console.error('Error fetching mock data:', error);
      // Fallback to hardcoded data nếu API không hoạt động
      setQcTests([
        {
          id: 'QC-001',
          test_type: 'Microbial Testing',
          test_name: 'Vi sinh vật',
          test_result: '550 CFU/g',
          acceptance_criteria: '< 100 CFU/g',
          status: 'Failed',
          tested_date: '2026-02-18',
          product_name: 'Thực phẩm chức năng ABC',
          batch_number: 'BATCH-20260218-01',
        },
        {
          id: 'QC-002',
          test_type: 'Potency Testing',
          test_name: 'Độ tinh khiết',
          test_result: '98.5%',
          acceptance_criteria: '95-105%',
          status: 'Passed',
          tested_date: '2026-02-19',
          product_name: 'Vitamin D3 1000 IU',
          batch_number: 'BATCH-20260219-01',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (test) => {
    setAnalyzingId(test.id);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_type: test.test_type,
          test_name: test.test_name,
          test_result: test.test_result,
          acceptance_criteria: test.acceptance_criteria,
          product_name: test.product_name,
          batch_number: test.batch_number,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalyses((prev) => ({
          ...prev,
          [test.id]: {
            text: result.analysis,
            timestamp: result.timestamp,
            model: result.model_used,
          },
        }));
      } else {
        setAnalyses((prev) => ({
          ...prev,
          [test.id]: {
            text: result.analysis || 'Lỗi khi phân tích',
            timestamp: result.timestamp,
            model: result.model_used,
            error: true,
          },
        }));
      }
    } catch (error) {
      console.error('Error analyzing test:', error);
      setAnalyses((prev) => ({
        ...prev,
        [test.id]: {
          text: `Lỗi kết nối: ${error.message}`,
          timestamp: new Date().toISOString(),
          error: true,
        },
      }));
    } finally {
      setAnalyzingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      case 'borderline':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  if (loading) {
    return <div className="qc-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="qc-test-container">
      <div className="qc-header">
        <h1>🧪 Hệ thống Kiểm định Chất lượng (QC)</h1>
        <p className="qc-subtitle">Phân tích kết quả test với AI</p>
      </div>

      <div className="qc-table-wrapper">
        <table className="qc-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Loại Test</th>
              <th>Kết quả</th>
              <th>Tiêu chuẩn</th>
              <th>Trạng thái</th>
              <th>Ngày test</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {qcTests.map((test) => (
              <React.Fragment key={test.id}>
                <tr className="qc-row">
                  <td className="qc-id">{test.id}</td>
                  <td>
                    <div className="qc-product">
                      <strong>{test.product_name}</strong>
                      <small>{test.batch_number}</small>
                    </div>
                  </td>
                  <td>{test.test_name}</td>
                  <td className="qc-result">
                    <strong>{test.test_result}</strong>
                  </td>
                  <td className="qc-criteria">{test.acceptance_criteria}</td>
                  <td>
                    <span
                      className="qc-status-badge"
                      style={{ backgroundColor: getStatusColor(test.status) }}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td>{test.tested_date}</td>
                  <td>
                    <button
                      className="qc-analyze-btn"
                      onClick={() => handleAnalyze(test)}
                      disabled={analyzingId === test.id}
                    >
                      {analyzingId === test.id ? (
                        <>
                          <span className="spinner"></span> Đang phân tích...
                        </>
                      ) : (
                        <>🤖 AI Analysis</>
                      )}
                    </button>
                  </td>
                </tr>

                {analyses[test.id] && (
                  <tr className="qc-analysis-row">
                    <td colSpan="8">
                      <div
                        className={`qc-analysis-box ${analyses[test.id].error ? 'error' : ''}`}
                      >
                        <div className="qc-analysis-header">
                          <span className="qc-analysis-icon">
                            {analyses[test.id].error ? '⚠️' : '🤖'}
                          </span>
                          <strong>Nhận xét từ AI:</strong>
                          <span className="qc-analysis-model">
                            {analyses[test.id].model || 'AI Model'}
                          </span>
                        </div>
                        <div className="qc-analysis-content">
                          {analyses[test.id].text}
                        </div>
                        <div className="qc-analysis-footer">
                          <small>
                            Phân tích lúc:{' '}
                            {new Date(analyses[test.id].timestamp).toLocaleString(
                              'vi-VN',
                            )}
                          </small>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="qc-footer">
        <p>
          💡 <strong>Hướng dẫn:</strong> Nhấn nút "🤖 AI Analysis" để xem nhận
          xét từ AI về mỗi kết quả test
        </p>
      </div>
    </div>
  );
};

export default QCTestList;
