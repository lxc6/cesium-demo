import React from 'react';
import { createRoot, Root } from 'react-dom/client';

/**
 * 弹窗基类，提供通用的弹窗管理功能
 */
export class PopupBase {
	protected container: HTMLDivElement | null = null;
	protected root: Root | null = null;
	protected isVisible: boolean = false;
	protected autoCloseTimer: NodeJS.Timeout | null = null;
	protected autoCloseDelay: number = 5000; // 默认5秒后自动关闭
	protected mountContainer: HTMLElement | (() => HTMLElement) = document.body;

	/**
	 * 设置挂载容器
	 * @param container HTML元素或返回HTML元素的函数
	 */
	protected setMountContainer(
		container: HTMLElement | (() => HTMLElement)
	): void {
		this.mountContainer = container;
		console.log(
			'设置挂载容器:',
			typeof container === 'function' ? '函数' : container
		);
	}

	/**
	 * 创建弹窗容器
	 * @param className 容器的CSS类名
	 * @returns HTMLDivElement 创建的容器元素
	 */
	protected createContainer(
		className: string = 'popup-container'
	): HTMLDivElement {
		if (this.container) {
			const parent = this.container.parentElement;
			if (parent) {
				parent.removeChild(this.container);
			}
			this.root = null;
		}

		const container = document.createElement('div');
		container.className = className;

		// 获取挂载容器
		const mountElement =
			typeof this.mountContainer === 'function'
				? this.mountContainer()
				: this.mountContainer;

		console.log('挂载容器:', mountElement);
		if (mountElement) {
			mountElement.appendChild(container);
		} else {
			console.warn('找不到挂载容器，使用 document.body 作为默认值');
			document.body.appendChild(container);
		}

		this.container = container;
		return container;
	}

	/**
	 * 设置弹窗位置
	 * @param x X坐标
	 * @param y Y坐标
	 */
	public setPosition(x: number, y: number): void {
		if (!this.container) return;

		this.container.style.position = 'absolute';
		this.container.style.left = `${x}px`;
		this.container.style.top = `${y}px`;
		this.container.style.zIndex = '1000';
	}

	/**
	 * 显示弹窗
	 * @param component React组件
	 * @param props 组件属性
	 */
	protected renderComponent(
		component: React.ComponentType<any>,
		props: any
	): void {
		if (!this.container) {
			this.createContainer();
		}

		try {
			// 确保容器已添加到DOM中
			if (!this.container.parentElement) {
				// 获取挂载容器
				const mountElement =
					typeof this.mountContainer === 'function'
						? this.mountContainer()
						: this.mountContainer;

				console.log('重新挂载容器:', mountElement);
				if (mountElement) {
					mountElement.appendChild(this.container);
				} else {
					console.warn(
						'找不到挂载容器，使用 document.body 作为默认值'
					);
					document.body.appendChild(this.container);
				}
			}

			if (!this.root) {
				console.log('创建React根节点:', this.container);
				this.root = createRoot(this.container!);
			}

			// 添加关闭回调
			const enhancedProps = {
				...props,
				onClose: () => this.close(),
			};

			console.log(
				'渲染组件到容器:',
				component.name || '未命名组件',
				props
			);
			this.root.render(React.createElement(component, enhancedProps));
			this.isVisible = true;

			// // 设置自动关闭
			// this.setAutoClose();
		} catch (error) {
			console.error('渲染组件时出错:', error);
		}
	}

	// /**
	//  * 设置自动关闭
	//  * @param delay 延迟时间(毫秒)
	//  */
	// public setAutoClose(delay?: number): void {
	//     if (this.autoCloseTimer) {
	//         clearTimeout(this.autoCloseTimer);
	//         this.autoCloseTimer = null;
	//     }

	//     if (delay === 0) return; // 如果delay为0，则不自动关闭

	//     this.autoCloseTimer = setTimeout(() => {
	//         this.close();
	//     }, delay || this.autoCloseDelay);
	// }

	/**
	 * 关闭弹窗
	 */
	public close(): void {
		if (this.root) {
			const root = this.root;
			try {
				// 使用 requestAnimationFrame 确保在下一帧进行卸载
				requestAnimationFrame(() => {
					try {
						root.unmount();
						this.root = null;

						if (
							this.container instanceof HTMLDivElement &&
							this.container.parentNode
						) {
							this.container.parentNode.removeChild(
								this.container
							);
							this.container = null;
						}

						this.isVisible = false;
						console.log('弹窗已关闭');
					} catch (error) {
						console.error('清理弹窗时出错:', error);
					}
				});
			} catch (error) {
				console.error('卸载React根节点时出错:', error);
			}
		} else if (
			this.container instanceof HTMLDivElement &&
			this.container.parentNode
		) {
			try {
				this.container.parentNode.removeChild(this.container);
				this.container = null;
				this.isVisible = false;
			} catch (error) {
				console.error('移除容器时出错:', error);
			}
		}
	}

	/**
	 * 检查弹窗是否可见
	 * @returns boolean 是否可见
	 */
	public isOpen(): boolean {
		return this.isVisible;
	}

	/**
	 * 销毁弹窗实例
	 */
	public destroy(): void {
		this.close();
	}
}
