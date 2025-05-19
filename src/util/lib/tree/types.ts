export interface TreeNode<T> {
    layer?: any;
    // 标识符
    id: string;
    name: string;
    edit?: boolean;
    children?: TreeNode<T>[];
    // 父级id
    parentId?: string;
}
