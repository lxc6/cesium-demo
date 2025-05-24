import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseOutlined } from '@ant-design/icons';
import './DraggableDialog.scss';

interface DraggableDialogProps {
	children: React.ReactNode;
	onClose?: () => void;
	className?: string;
	title?: string; // 用于指定可拖动区域的类名
	parentClassName?: string; // 用于指定父容器的类名
	getContainer?: HTMLElement | (() => HTMLElement) | false;
}

const DraggableDialog: React.FC<DraggableDialogProps> = ({
	children,
	onClose,
	className = '',
	title,
	parentClassName,
	getContainer,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const dialogRef = useRef<HTMLDivElement>(null);
	const initialPositionSet = useRef(false);
	const [container, setContainer] = useState<HTMLElement | null>(null);

	// 获取挂载容器
	useEffect(() => {
		let mountNode: HTMLElement;
		if (getContainer === false) {
			return;
		} else if (getContainer instanceof HTMLElement) {
			mountNode = getContainer;
		} else if (typeof getContainer === 'function') {
			mountNode = getContainer();
		} else {
			mountNode = document.body;
		}
		setContainer(mountNode);
	}, [getContainer]);

	const updatePosition = (x: number, y: number) => {
		if (!dialogRef.current || !parentClassName) return;

		const parentElement = document.querySelector(`.${parentClassName}`);
		if (!parentElement) return;

		const parentRect = parentElement.getBoundingClientRect();
		const dialogRect = dialogRef.current.getBoundingClientRect();

		// 计算可拖动范围，允许完全拖动
		const maxX = parentRect.width - 20; // 右边界留20px边距
		const minX = 20; // 左边界留20px边距
		const maxY = parentRect.height - 20; // 下边界留20px边距
		const minY = 20; // 上边界留20px边距

		// 计算相对于父容器的位置
		let newX = x;
		let newY = y;

		// 确保弹窗不会完全拖出父容器
		if (newX < minX) newX = minX;
		if (newX > maxX - dialogRect.width) newX = maxX - dialogRect.width;
		if (newY < minY) newY = minY;
		if (newY > maxY - dialogRect.height) newY = maxY - dialogRect.height;

		setPosition({ x: newX, y: newY });
	};

	// 设置初始位置
	useEffect(() => {
		// 使用 requestAnimationFrame 确保在下一帧设置位置
		const timer = requestAnimationFrame(() => {
			if (
				!initialPositionSet.current &&
				dialogRef.current &&
				parentClassName
			) {
				const parentElement = document.querySelector(
					`.${parentClassName}`
				);
				if (parentElement) {
					const parentRect = parentElement.getBoundingClientRect();
					const dialogRect =
						dialogRef.current.getBoundingClientRect();

					// 默认放在父元素的右下角，并留出20px的边距
					const initialX = parentRect.width - dialogRect.width - 20;
					const initialY = parentRect.height - dialogRect.height - 20;

					setPosition({ x: initialX, y: initialY });
					initialPositionSet.current = true;
				}
			}
		});

		return () => cancelAnimationFrame(timer);
	}, [parentClassName, container]); // 添加 container 作为依赖

	const handleMouseDown = (e: React.MouseEvent) => {
		// 只允许通过标题栏拖动
		const target = e.target as HTMLElement;
		if (!target.closest('.dialog-header')) {
			return;
		}

		const parentElement = parentClassName
			? document.querySelector(`.${parentClassName}`)
			: null;
		if (!parentElement) return;

		const parentRect = parentElement.getBoundingClientRect();
		const dialogRect = dialogRef.current?.getBoundingClientRect();
		if (!dialogRect) return;

		setIsDragging(true);
		setDragStart({
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		});

		// 防止文本选择
		e.preventDefault();
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;

		const newX = e.clientX - dragStart.x;
		const newY = e.clientY - dragStart.y;

		updatePosition(newX, newY);
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, dragStart]);

	const dialogContent = (
		<div
			ref={dialogRef}
			className={`draggable-dialog ${className} ${
				isDragging ? 'dragging' : ''
			}`}
			style={{
				transform: `translate(${position.x}px, ${position.y}px)`,
				opacity: initialPositionSet.current ? 1 : 0, // 添加透明度过渡
				transition: 'opacity 0.2s',
			}}
		>
			{onClose && (
				<button className='dialog-close-btn' onClick={onClose}>
					<CloseOutlined />
				</button>
			)}
			<div className='dialog-header' onMouseDown={handleMouseDown}>
				<div className='dialog-title'>{title || '标题'}</div>
			</div>
			<div className='dialog-content'>{children}</div>
		</div>
	);

	// 如果 getContainer 为 false，直接渲染
	if (getContainer === false) {
		return dialogContent;
	}

	// 等待容器准备好
	if (!container) {
		return null;
	}

	// 使用 Portal 渲染到指定容器
	return createPortal(dialogContent, container);
};

export default DraggableDialog;
