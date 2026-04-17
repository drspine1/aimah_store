import type { NextApiRequest, NextApiResponse } from 'next'

// Tidewave dev-tool handler — disabled, kept as placeholder
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(404).end()
}
