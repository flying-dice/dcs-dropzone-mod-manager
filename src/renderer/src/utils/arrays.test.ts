import { chunks } from './arrays'

describe('arrays', () => {
  describe('chunks', () => {
    it('should return an empty array if the input array is empty', () => {
      const input = []
      const n = 2
      const result = Array.from(chunks(input, n))
      expect(result).toEqual([])
    })
    it('should return an array with a single chunk if the input array has a length less than n', () => {
      const input = [1]
      const n = 2
      const result = Array.from(chunks(input, n))
      expect(result).toEqual([[1]])
    })
    it('should return an array with a single chunk if the input array has a length equal to n', () => {
      const input = [1, 2]
      const n = 2
      const result = Array.from(chunks(input, n))
      expect(result).toEqual([[1, 2]])
    })
    it('should return an array with multiple chunks if the input array has a length greater than n', () => {
      const input = [1, 2, 3, 4, 5]
      const n = 2
      const result = Array.from(chunks(input, n))
      expect(result).toEqual([[1, 2], [3, 4], [5]])
    })
  })
})
