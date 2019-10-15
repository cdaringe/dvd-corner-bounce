export class RotatingDeque<T> {
  public deque: T[] = []
  constructor (public opts: { items: T[] }) {
    this.deque = opts.items
  }

  rotate () {
    if (!this.deque.length) throw new Error('no more items')
    if (this.deque.length === 1) return
    const last = this.deque.pop()
    this.deque = [last!, ...this.deque]
  }

  get length () {
    return this.deque.length
  }
}
