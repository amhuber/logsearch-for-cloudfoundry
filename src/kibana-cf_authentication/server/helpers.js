const isObject = (value) => {
  return value instanceof Object && !(value instanceof Array)
}

const ensureKeys = (value, keys) => {
  let key
  while (keys.length) {
    key = keys.shift()
    if (typeof value[key] === 'undefined') {
      value[key] = {}
    }
    value = value[key]
  }
  return value
}

const filterQuery = (payload, cached) => {
  let bool = ensureKeys(payload, ['query', 'bool'])

  bool.must = bool.must || []
  // Note: the `must` clause may be an array or an object
  if (isObject(bool.must)) {
    bool.must = [bool.must]
  }
  bool.must.push(
    { 'terms': { '@cf.space_id': cached.account.spaceIds } },
    { 'terms': { '@cf.org_id': cached.account.orgIds } }
  )
  return payload
}

const uaaPaginatorV3 = async (get, url, values = []) => {
  const response = await get(url, { 'per_page': 100 })

  const data = response.resources.map(resource => ({
    guid: resource.guid,
    name: resource.name,
  }))

  const updatedValues = values.concat(data)

  if (!response.pagination.next) return updatedValues

  return uaaPaginatorV3(get, response.pagination.next.href, updatedValues)
}

module.exports = {
  filterQuery,
  uaaPaginatorV3
}
