/**
 *  ---------------------------find.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    说明
 *  @Version        0.0.1
 *  @Author         li xusheng
 *  @Date           2022/11/30
 *  @Param
 *  @Return
 *  @File           libs/util/src/lib/tree find.ts
 *  @Update         [time:user] 某用户更新此文件
 * */
import { TreeNode } from './types';

/**
 * 在树中查找field = value的子项
 * @param tree    源数据
 * @param field   数据字段
 * @param value   值
 */
export function findNodeByField<T extends TreeNode<T>, D = string>(
    tree: T[],
    field: keyof T,
    value: D
): T | undefined {
    let res: T | undefined;
    for (let i = 0, len = tree.length; i < len; i++) {
        if (tree[i][field] === value) {
            res = tree[i];
            break;
        }
        if (tree[i].children) {
            res = findNodeByField(tree[i].children as T[], field, value);
        }
    }
    return res;
}

/**
 * 按名称模糊查找树
 * @param tree
 * @param name
 */
export function fuzzyFindTreeByName<T extends TreeNode<T>>(tree: T[], name: string) {
    let res: TreeNode<T> | undefined;
    for (let i = 0, len = tree.length; i < len; i++) {
        const node = tree[i];
        if (node.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) {
            res = tree[i];
            break;
        }
        if (node.children) {
            res = fuzzyFindTreeByName(node.children, name);
            if (res) break;
        }
    }
    return res;
}

/**
 * 获取节点在树中的id链
 * @param treeArr   展平后的树
 * @param id        节点id
 */
export function getParentIds<T extends TreeNode<null>>(treeArr: T[], id: string) {
    const ids = [id];
    let child = treeArr.find(node => node.id === id);
    while (child && child.parentId) {
        ids.unshift(child.parentId);
        const { parentId } = child;
        child = treeArr.find(node => node.id === parentId);
    }
    return ids;
}

/**
 * 查找字段等于value的节点，并替换节点
 * @description         查找keyNode === target 的数据并替换replaceField的数据为value
 * @param tree          数据源
 * @param keyNode       查找的字段名
 * @param target        查找的字段目标值
 * @param node          替换的值
 * @param remove        是否移除 默认为false
 */
export function replaceAfterFind<T extends TreeNode<T>>(
    tree: Array<T>,
    keyNode: keyof T,
    target: T[keyof T],
    node?: T,
    remove = false
) {
    for (let i = 0, len = tree.length; i < len; i++) {
        const item = tree[i];
        // eslint-disable-next-line no-continue
        if (!item) continue;
        if (item[keyNode] === target) {
            if (remove) tree.splice(i, 1);
            else if (node) tree[i] = node;
            return;
        }
        if (item.children && Array.isArray(item.children)) {
            replaceAfterFind(item.children as T[], keyNode, target, node, remove);
        }
    }
}

/**
 * 查找节点的兄弟节点
 * @param arr
 * @param id
 */
export function findNodeSiblings<T extends TreeNode<T>>(
    arr: Array<T>,
    id: string
): Array<T> | undefined {
    let result;
    let subResult;
    arr.forEach(item => {
        if (item.id === id) {
            result = arr;
        } else if (item.children) {
            subResult = findNodeSiblings(item.children as T[], id);
            if (subResult) result = subResult;
        }
    });
    return result;
}
