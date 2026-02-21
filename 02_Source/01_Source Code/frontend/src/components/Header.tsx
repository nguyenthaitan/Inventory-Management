import React from 'react';

const Header: React.FC = () => {
	return (
		<header style={{ background: '#1e293b', color: '#fff', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			<div style={{ fontWeight: 'bold', fontSize: 24 }}>Inventory Management</div>
			<nav>
			</nav>
		</header>
	);
};

export default Header;
