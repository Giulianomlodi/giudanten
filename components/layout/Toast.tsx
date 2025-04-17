import React, { useState, useEffect } from 'react';

interface ToastProps {
	children: React.ReactNode;
	onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ children, onClose }) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return (
		<div className="toast" style={{
			position: 'fixed',
			bottom: '20px',
			right: '0',
			maxWidth: '300px',
			background: '#333',
			color: '#fff',
			padding: '10px 20px',
			borderRadius: '5px',
			zIndex: 1000,
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'flex-start',
			boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
		}}>
			<div style={{
				wordBreak: 'break-word',
				marginRight: '10px',
				flex: 1,
			}}>
				{children}
			</div>
			<button
				onClick={onClose}
				style={{
					background: 'rgba(255, 255, 255, 0.2)',
					border: 'none',
					color: '#fff',
					cursor: 'pointer',
					fontSize: '18px',
					fontWeight: 'bold',
					width: '24px',
					height: '24px',
					borderRadius: '50%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 0,
					marginLeft: '10px',
					flexShrink: 0,
				}}
			>
				×
			</button>
		</div>
	);
};

export default Toast;