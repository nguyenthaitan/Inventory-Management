import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
	return (
		<aside style={{ width: 220, background: '#334155', color: '#fff', height: '100vh', padding: '24px 0' }}>
			<ul style={{ listStyle: 'none', padding: 0 }}>
				<li><Link to="/admin/dashboard" style={{ color: '#fff', textDecoration: 'none', padding: '8px 24px', display: 'block' }}>IT Dashboard</Link></li>
				<li><Link to="/admin/monitoring" style={{ color: '#fff', textDecoration: 'none', padding: '8px 24px', display: 'block' }}>System Monitoring</Link></li>
				<li><Link to="/qc/dashboard" style={{ color: '#fff', textDecoration: 'none', padding: '8px 24px', display: 'block' }}>QC Dashboard</Link></li>
				<li><Link to="/qc/inbound" style={{ color: '#fff', textDecoration: 'none', padding: '8px 24px', display: 'block' }}>Inbound Control</Link></li>
				{/* Thêm các mục cho các role khác nếu cần */}
			</ul>
		</aside>
	);
};

export default Sidebar;
