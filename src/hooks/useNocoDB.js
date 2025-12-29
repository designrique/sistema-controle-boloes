import { useState, useEffect, useCallback } from 'react'
import nocodbService from '../services/nocodb'

export function useNocoDB(tableId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, total: 0 })

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await nocodbService.list(tableId, params)
      setData(result.list || result.data || [])
      setPagination(prev => ({
        ...prev,
        page: result.page || 1,
        pageSize: result.pageSize || 25,
        total: result.totalRecords || 0
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tableId])

  const getById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await nocodbService.get(id, tableId)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [tableId])

  const create = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await nocodbService.create(data, tableId)
      await fetchData()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [tableId, fetchData])

  const update = useCallback(async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await nocodbService.update(id, data, tableId)
      await fetchData()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [tableId, fetchData])

  const remove = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await nocodbService.delete(id, tableId)
      await fetchData()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [tableId, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    pagination,
    refetch: fetchData,
    getById,
    create,
    update,
    remove,
  }
}

export default useNocoDB
