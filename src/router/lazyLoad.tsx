import { Suspense, lazy } from 'react'

/**
 * 将懒加载的组件使用 Suspense 进行包裹，防止悬而未决
 * @param imported
 */
function lazyLoad(imported) {
    const Component = lazy(() => imported)
    return (
        <Suspense fallback={<>Loading</>}>
            <Component />
        </Suspense>
    )
}

export default lazyLoad
