import { cloneDeep } from 'lodash-es';
import { TreeNode } from './types';

/**
 * 展平树形结构
 * @param tree      源数据
 * @param parentId  初始父级id 默认为0
 */
export function flatten<T extends TreeNode<T>>(tree: Array<T>, parentId = '0') {
    const res: Array<T> = [];
    if (tree && tree.length <= 0) return [];
    tree.forEach(treeNode => {
        const copyNode: T = cloneDeep(treeNode);
        copyNode.parentId = parentId;
        delete copyNode.children;
        res.push(copyNode);
        // 存在children说明不是最后一级,如果不存在则返回需要的数据
        if (Array.isArray(treeNode.children) && treeNode.children.length > 0) {
            res.push(...(flatten(treeNode.children, treeNode.id) as T[]));
        }
    });

    return res;
}
/**
 * 将数组转为tree
 * @param data      数据源数组
 */
export function generateTree<T extends TreeNode<T>, D extends Array<T> = T[]>(data: D): T[] {
    const tree: any = {};
    const r: T[] = [];
    data.forEach(item => {
        const key = item.id;
        tree[key] = { ...item, children: (tree[key] && tree[key].children) || [] };
        if (data.findIndex(d => d.id === item.parentId && d.id !== item.id) === -1) {
            r.push(tree[key]);
        } else if (item.parentId) {
            tree[item.parentId] = tree[item.parentId] || {};
            tree[item.parentId].children = tree[item.parentId].children || [];
            tree[item.parentId].children.push(tree[key]);
        }
    }, Object.create(null));
    return r;
}
