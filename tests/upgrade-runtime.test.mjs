import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { Box, Grid } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { createClient } from '@supabase/supabase-js'

test('upgraded UI and data packages expose the APIs used by the app', () => {
  assert.equal(typeof React.createElement, 'function')
  assert.equal(typeof Box, 'object')
  assert.equal(typeof Grid, 'object')
  assert.equal(typeof DataGrid, 'object')
  assert.equal(typeof createClient, 'function')
})