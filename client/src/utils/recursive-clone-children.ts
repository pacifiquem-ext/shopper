import * as React from 'react'

export function recursiveCloneChildren(
  children: React.ReactNode,
  sharedProps: Record<string, unknown>,
  targetDisplayNames: string[] = [],
  uniqueId: string,
  asChild?: boolean,
): React.ReactNode {
  return React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child
    }

    const displayName =
      typeof child.type === 'string'
        ? child.type
        : ((child.type as { displayName?: string }).displayName ?? '')

    const shouldMerge = targetDisplayNames.includes(displayName)
    const childProps = child.props as {
      children?: React.ReactNode
      className?: string
    }

    const newChildren = childProps.children
      ? recursiveCloneChildren(
          childProps.children,
          sharedProps,
          targetDisplayNames,
          uniqueId,
          asChild,
        )
      : childProps.children

    return React.cloneElement(
      child,
      {
        ...(shouldMerge ? sharedProps : {}),
        key: child.key ?? `${uniqueId}-${index}`,
        children: newChildren,
      } as never,
    )
  })
}
