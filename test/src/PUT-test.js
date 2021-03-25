const si = require('../../')
const test = require('tape')

const sandbox = 'test/sandbox/'
const indexName = sandbox + 'PUT'

const carData = [
  {
    _id: 0,
    make: 'Tesla',
    manufacturer: 'Volvo',
    brand: 'Volvo'
  },
  {
    _id: 1,
    make: 'BMW',
    manufacturer: 'Volvo',
    brand: 'Volvo'
  },
  {
    _id: 2,
    make: 'Tesla',
    manufacturer: 'Tesla',
    brand: 'Volvo'
  }
]

test('create a search index', t => {
  t.plan(1)
  si({ name: indexName }).then(db => {
    global[indexName] = db
    t.pass('ok')
  })
})

test('can add data', t => {
  t.plan(1)
  global[indexName].PUT(carData).then(response =>
    t.deepEquals(response, [
      { _id: '0', status: 'CREATED', operation: 'PUT' },
      { _id: '1', status: 'CREATED', operation: 'PUT' },
      { _id: '2', status: 'CREATED', operation: 'PUT' }
    ])
  )
})

test('Verify that PUT has created an appropriate index (_PUT_1)', t => {
  const indexEntries = [
    { key: 'brand:volvo#1.00', value: ['0', '1', '2'] },
    { key: 'make:bmw#1.00', value: ['1'] },
    { key: 'make:tesla#1.00', value: ['0', '2'] },
    { key: 'manufacturer:tesla#1.00', value: ['2'] },
    { key: 'manufacturer:volvo#1.00', value: ['0', '1'] },
    { key: '￮DOCUMENT_COUNT￮', value: 3 },
    { key: '￮DOC_RAW￮0￮', value: { _id: 0, make: 'Tesla', manufacturer: 'Volvo', brand: 'Volvo' } },
    { key: '￮DOC_RAW￮1￮', value: { _id: 1, make: 'BMW', manufacturer: 'Volvo', brand: 'Volvo' } },
    { key: '￮DOC_RAW￮2￮', value: { _id: 2, make: 'Tesla', manufacturer: 'Tesla', brand: 'Volvo' } },
    { key: '￮DOC￮0￮', value: { _id: '0', make: ['tesla#1.00'], manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮DOC￮1￮', value: { _id: '1', make: ['bmw#1.00'], manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮DOC￮2￮', value: { _id: '2', make: ['tesla#1.00'], manufacturer: ['tesla#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮FIELD￮brand￮', value: 'brand' },
    { key: '￮FIELD￮make￮', value: 'make' },
    { key: '￮FIELD￮manufacturer￮', value: 'manufacturer' }
  ]
  t.plan(indexEntries.length)
  global[indexName].INDEX.STORE.createReadStream({ lt: '￮￮' }).on('data', d => {
    t.deepEquals(d, indexEntries.shift())
  })
})

const autoGeneratedIds = []

test('can add data', t => {
  const data = [
    'this is a really interesting document',
    'this is a document about bananas',
    'This document is mostly oranges oranges oranges, not bananas.'
  ]
  t.plan(9)
  global[indexName].PUT(data).then(response => response.forEach(item => {
    t.equals(item.operation, 'PUT')
    t.equals(item.status, 'CREATED')
    t.match(item._id, /\d{13}-\d/gm, 'id has correct format')
    autoGeneratedIds.push(item._id)
  }))
})

test('Verify that PUT has created an appropriate index (_PUT_1 again)', t => {
  const indexEntries = [
    { key: 'body:a#1.00', value: [autoGeneratedIds[0], autoGeneratedIds[1]] },
    { key: 'body:about#1.00', value: [autoGeneratedIds[1]] },
    { key: 'body:bananas#0.33', value: [autoGeneratedIds[2]] },
    { key: 'body:bananas#1.00', value: [autoGeneratedIds[1]] },
    { key: 'body:document#0.33', value: [autoGeneratedIds[2]] },
    {
      key: 'body:document#1.00',
      value: [autoGeneratedIds[0], autoGeneratedIds[1]]
    },
    { key: 'body:interesting#1.00', value: [autoGeneratedIds[0]] },
    { key: 'body:is#0.33', value: [autoGeneratedIds[2]] },
    {
      key: 'body:is#1.00',
      value: [autoGeneratedIds[0], autoGeneratedIds[1]]
    },
    { key: 'body:mostly#0.33', value: [autoGeneratedIds[2]] },
    { key: 'body:not#0.33', value: [autoGeneratedIds[2]] },
    { key: 'body:oranges#1.00', value: [autoGeneratedIds[2]] },
    { key: 'body:really#1.00', value: [autoGeneratedIds[0]] },
    { key: 'body:this#0.33', value: [autoGeneratedIds[2]] },
    {
      key: 'body:this#1.00',
      value: [autoGeneratedIds[0], autoGeneratedIds[1]]
    },
    { key: 'brand:volvo#1.00', value: ['0', '1', '2'] },
    { key: 'make:bmw#1.00', value: ['1'] },
    { key: 'make:tesla#1.00', value: ['0', '2'] },
    { key: 'manufacturer:tesla#1.00', value: ['2'] },
    { key: 'manufacturer:volvo#1.00', value: ['0', '1'] },
    { key: '￮DOCUMENT_COUNT￮', value: 6 },
    {
      key: '￮DOC_RAW￮0￮',
      value: { _id: 0, make: 'Tesla', manufacturer: 'Volvo', brand: 'Volvo' }
    },
    { key: '￮DOC_RAW￮' + autoGeneratedIds[0] + '￮', value: { body: 'this is a really interesting document', _id: autoGeneratedIds[0] } },
    { key: '￮DOC_RAW￮' + autoGeneratedIds[1] + '￮', value: { body: 'this is a document about bananas', _id: autoGeneratedIds[1] } },
    { key: '￮DOC_RAW￮' + autoGeneratedIds[2] + '￮', value: { body: 'This document is mostly oranges oranges oranges, not bananas.', _id: autoGeneratedIds[2] } },
    {
      key: '￮DOC_RAW￮1￮',
      value: { _id: 1, make: 'BMW', manufacturer: 'Volvo', brand: 'Volvo' }
    },
    {
      key: '￮DOC_RAW￮2￮',
      value: { _id: 2, make: 'Tesla', manufacturer: 'Tesla', brand: 'Volvo' }
    },
    { key: '￮DOC￮0￮', value: { _id: '0', make: ['tesla#1.00'], manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮DOC￮' + autoGeneratedIds[0] + '￮', value: { body: ['a#1.00', 'document#1.00', 'interesting#1.00', 'is#1.00', 'really#1.00', 'this#1.00'], _id: autoGeneratedIds[0] } },
    { key: '￮DOC￮' + autoGeneratedIds[1] + '￮', value: { body: ['a#1.00', 'about#1.00', 'bananas#1.00', 'document#1.00', 'is#1.00', 'this#1.00'], _id: autoGeneratedIds[1] } },
    { key: '￮DOC￮' + autoGeneratedIds[2] + '￮', value: { body: ['bananas#0.33', 'document#0.33', 'is#0.33', 'mostly#0.33', 'not#0.33', 'oranges#1.00', 'this#0.33'], _id: autoGeneratedIds[2] } },
    { key: '￮DOC￮1￮', value: { _id: '1', make: ['bmw#1.00'], manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮DOC￮2￮', value: { _id: '2', make: ['tesla#1.00'], manufacturer: ['tesla#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮FIELD￮body￮', value: 'body' },
    { key: '￮FIELD￮brand￮', value: 'brand' },
    { key: '￮FIELD￮make￮', value: 'make' },
    { key: '￮FIELD￮manufacturer￮', value: 'manufacturer' }
  ]
  t.plan(indexEntries.length)
  global[indexName].INDEX.STORE.createReadStream({ lt: '￮￮' }).on('data', d => t.deepEqual(d, indexEntries.shift()))
})

const indexName2 = sandbox + '_PUT-2'

test('create another search index', t => {
  t.plan(1)
  si({ name: indexName2 }).then(db => {
    global[indexName2] = db
    t.pass('ok')
  })
})

test('can add data', t => {
  t.plan(1)
  global[indexName2].PUT(carData, {
    doNotIndexField: ['make']
  }).then(response =>
    t.deepEquals(response, [
      { _id: '0', status: 'CREATED', operation: 'PUT' },
      { _id: '1', status: 'CREATED', operation: 'PUT' },
      { _id: '2', status: 'CREATED', operation: 'PUT' }
    ])
  )
})

test('Verify that PUT has created an appropriate index (_PUT_2)', t => {
  const indexEntries = [
    { key: 'brand:volvo#1.00', value: ['0', '1', '2'] },
    { key: 'manufacturer:tesla#1.00', value: ['2'] },
    { key: 'manufacturer:volvo#1.00', value: ['0', '1'] },
    { key: '￮DOCUMENT_COUNT￮', value: 3 },
    { key: '￮DOC_RAW￮0￮', value: { _id: 0, manufacturer: 'Volvo', make: 'Tesla', brand: 'Volvo' } },
    { key: '￮DOC_RAW￮1￮', value: { _id: 1, manufacturer: 'Volvo', make: 'BMW', brand: 'Volvo' } },
    { key: '￮DOC_RAW￮2￮', value: { _id: 2, manufacturer: 'Tesla', make: 'Tesla', brand: 'Volvo' } },
    { key: '￮DOC￮0￮', value: { _id: '0', make: ['tesla#1.00'], manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮DOC￮1￮', value: { _id: '1', make: ['bmw#1.00'], manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮DOC￮2￮', value: { _id: '2', make: ['tesla#1.00'], manufacturer: ['tesla#1.00'], brand: ['volvo#1.00'] } },
    { key: '￮FIELD￮brand￮', value: 'brand' },
    { key: '￮FIELD￮manufacturer￮', value: 'manufacturer' }
  ]
  t.plan(indexEntries.length)
  global[indexName2].INDEX.STORE.createReadStream({ lt: '￮￮' }).on('data', d => {
    t.deepEquals(d, indexEntries.shift())
  })
})

const indexName3 = sandbox + '_PUT-3'

test('create another search index', t => {
  t.plan(1)
  si({ name: indexName3 }).then(db => {
    global[indexName3] = db
    t.pass('ok')
  })
})

test('can add data', t => {
  t.plan(1)
  global[indexName3].PUT([
    {
      _id: 0,
      make: 'Tesla',
      info: {
        manufacturer: 'Volvo',
        brand: 'Volvo'
      }
    },
    {
      _id: 1,
      make: 'BMW',
      info: {
        manufacturer: 'Volvo',
        brand: 'Volvo'
      }
    },
    {
      _id: 2,
      make: 'Tesla',
      info: {
        manufacturer: 'Tesla',
        brand: 'Volvo'
      }
    }
  ], {
    doNotIndexField: ['info.manufacturer']
  }).then(response =>
    t.deepEquals(response, [
      { _id: '0', status: 'CREATED', operation: 'PUT' },
      { _id: '1', status: 'CREATED', operation: 'PUT' },
      { _id: '2', status: 'CREATED', operation: 'PUT' }
    ])
  )
})

test('Verify that PUT has created an appropriate index (_PUT_3)', t => {
  const indexEntries = [
    { key: 'info.brand:volvo#1.00', value: ['0', '1', '2'] },
    { key: 'make:bmw#1.00', value: ['1'] },
    { key: 'make:tesla#1.00', value: ['0', '2'] },
    { key: '￮DOCUMENT_COUNT￮', value: 3 },
    { key: '￮DOC_RAW￮0￮', value: { _id: 0, make: 'Tesla', info: { manufacturer: 'Volvo', brand: 'Volvo' } } },
    { key: '￮DOC_RAW￮1￮', value: { _id: 1, make: 'BMW', info: { manufacturer: 'Volvo', brand: 'Volvo' } } },
    { key: '￮DOC_RAW￮2￮', value: { _id: 2, make: 'Tesla', info: { manufacturer: 'Tesla', brand: 'Volvo' } } },
    { key: '￮DOC￮0￮', value: { _id: '0', make: ['tesla#1.00'], info: { manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } } },
    { key: '￮DOC￮1￮', value: { _id: '1', make: ['bmw#1.00'], info: { manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } } },
    { key: '￮DOC￮2￮', value: { _id: '2', make: ['tesla#1.00'], info: { manufacturer: ['tesla#1.00'], brand: ['volvo#1.00'] } } },
    { key: '￮FIELD￮info.brand￮', value: 'info.brand' },
    { key: '￮FIELD￮make￮', value: 'make' }
  ]
  t.plan(indexEntries.length)
  global[indexName3].INDEX.STORE.createReadStream({ lt: '￮￮' }).on('data', d => {
    t.deepEquals(d, indexEntries.shift())
  })
})

const indexName4 = sandbox + '_PUT-4'

test('create another search index', t => {
  t.plan(1)
  si({ name: indexName4 }).then(db => {
    global[indexName4] = db
    t.pass('ok')
  })
})

test('can add data JSON', t => {
  t.plan(1)
  global[indexName4].PUT([
    {
      _id: 0,
      make: 'Tesla',
      info: {
        manufacturer: 'Volvo',
        brand: 'Volvo'
      }
    },
    {
      _id: 1,
      make: 'BMW',
      info: {
        manufacturer: 'Volvo',
        brand: 'Volvo'
      }
    },
    {
      _id: 2,
      make: 'Tesla',
      info: {
        manufacturer: 'Tesla',
        brand: 'Volvo'
      }
    }
  ], {
    doNotIndexField: ['info.manufacturer']
  }).then(response =>
    t.deepEquals(response, [
      { _id: '0', status: 'CREATED', operation: 'PUT' },
      { _id: '1', status: 'CREATED', operation: 'PUT' },
      { _id: '2', status: 'CREATED', operation: 'PUT' }
    ])
  )
})

test('Verify that PUT has created an appropriate index (_PUT_4)', t => {
  const indexEntries = [
    { key: 'info.brand:volvo#1.00', value: ['0', '1', '2'] },
    { key: 'make:bmw#1.00', value: ['1'] },
    { key: 'make:tesla#1.00', value: ['0', '2'] },
    { key: '￮DOCUMENT_COUNT￮', value: 3 },
    { key: '￮DOC_RAW￮0￮', value: { _id: 0, make: 'Tesla', info: { manufacturer: 'Volvo', brand: 'Volvo' } } },
    { key: '￮DOC_RAW￮1￮', value: { _id: 1, make: 'BMW', info: { manufacturer: 'Volvo', brand: 'Volvo' } } },
    { key: '￮DOC_RAW￮2￮', value: { _id: 2, make: 'Tesla', info: { manufacturer: 'Tesla', brand: 'Volvo' } } },
    { key: '￮DOC￮0￮', value: { _id: '0', make: ['tesla#1.00'], info: { manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } } },
    { key: '￮DOC￮1￮', value: { _id: '1', make: ['bmw#1.00'], info: { manufacturer: ['volvo#1.00'], brand: ['volvo#1.00'] } } },
    { key: '￮DOC￮2￮', value: { _id: '2', make: ['tesla#1.00'], info: { manufacturer: ['tesla#1.00'], brand: ['volvo#1.00'] } } },
    { key: '￮FIELD￮info.brand￮', value: 'info.brand' },
    { key: '￮FIELD￮make￮', value: 'make' }
  ]
  t.plan(indexEntries.length)
  global[indexName4].INDEX.STORE.createReadStream({ lt: '￮￮' }).on('data', d => {
    t.deepEquals(d, indexEntries.shift())
  })
})

const indexName5 = sandbox + '_PUT-5'

test('create another search index', t => {
  t.plan(1)
  si({ name: indexName5 }).then(db => {
    global[indexName5] = db
    t.pass('ok')
  })
})

test('can add data JSON', t => {
  t.plan(1)
  global[indexName5].PUT([
    {
      _id: 0,
      make: 'Tesla',
      info: {
        manufacturer: {
          foo: 'XXX',
          bar: 'XXX'
        },
        brand: 'Volvo'
      }
    },
    {
      _id: 1,
      make: 'BMW',
      info: {
        manufacturer: {
          foo: 'XXX',
          bar: 'XXX'
        },
        brand: 'Volvo'
      }
    },
    {
      _id: 2,
      make: 'Tesla',
      info: {
        manufacturer: {
          foo: 'XXX',
          bar: 'XXX'
        },
        brand: 'Volvo'
      }
    }
  ], {
    doNotIndexField: ['info.manufacturer']
  }).then(response => t.deepEquals(response, [
    { _id: '0', status: 'CREATED', operation: 'PUT' },
    { _id: '1', status: 'CREATED', operation: 'PUT' },
    { _id: '2', status: 'CREATED', operation: 'PUT' }
  ]))
})

test('Verify that PUT has created an appropriate index (doesnt index children of DO_NOT_INDEX_FIELD)', t => {
  const indexEntries = [
    { key: 'info.brand:volvo#1.00', value: ['0', '1', '2'] },
    { key: 'make:bmw#1.00', value: ['1'] },
    { key: 'make:tesla#1.00', value: ['0', '2'] },
    { key: '￮DOCUMENT_COUNT￮', value: 3 },
    { key: '￮DOC_RAW￮0￮', value: { _id: 0, make: 'Tesla', info: { manufacturer: { foo: 'XXX', bar: 'XXX' }, brand: 'Volvo' } } },
    { key: '￮DOC_RAW￮1￮', value: { _id: 1, make: 'BMW', info: { manufacturer: { foo: 'XXX', bar: 'XXX' }, brand: 'Volvo' } } },
    { key: '￮DOC_RAW￮2￮', value: { _id: 2, make: 'Tesla', info: { manufacturer: { foo: 'XXX', bar: 'XXX' }, brand: 'Volvo' } } },
    { key: '￮DOC￮0￮', value: { _id: '0', make: ['tesla#1.00'], info: { manufacturer: { foo: ['xxx#1.00'], bar: ['xxx#1.00'] }, brand: ['volvo#1.00'] } } },
    { key: '￮DOC￮1￮', value: { _id: '1', make: ['bmw#1.00'], info: { manufacturer: { foo: ['xxx#1.00'], bar: ['xxx#1.00'] }, brand: ['volvo#1.00'] } } },
    { key: '￮DOC￮2￮', value: { _id: '2', make: ['tesla#1.00'], info: { manufacturer: { foo: ['xxx#1.00'], bar: ['xxx#1.00'] }, brand: ['volvo#1.00'] } } },
    { key: '￮FIELD￮info.brand￮', value: 'info.brand' },
    { key: '￮FIELD￮make￮', value: 'make' }
  ]
  t.plan(indexEntries.length)
  global[indexName5].INDEX.STORE.createReadStream({ lt: '￮￮' }).on('data', d => {
    t.deepEquals(d, indexEntries.shift())
  })
})
