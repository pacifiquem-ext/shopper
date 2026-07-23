import * as React from 'react'

export function recursiveCloneChildren(
  children: React.ReactNode,
  sharedProps: Record<string, unknown>,
  targetDisplayNames: string[] = [],
  uniqueId: string,
  asChild?: boolean,
): React.ReactNode {
  const mapped = React.Children.map(children, (child, index) => {
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

  // Children.map always returns an array; callers that need a single element
  // (e.g. Radix Slot via asChild) must not receive a one-item array.
  if (asChild && Array.isArray(mapped) && mapped.length === 1) {
    return mapped[0]
  }

  return mapped
}
