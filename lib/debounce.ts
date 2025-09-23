export function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout | null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    
    const later = () => {
      timeout = null
      func.apply(this, args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, delay)
  } as T
}
