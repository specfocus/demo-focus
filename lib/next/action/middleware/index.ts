import { NextRequest, NextResponse } from 'next/server';
import RequestBroker from './mongodb';
import Redux from './redux';

/** API */
export default function middleware(req: NextRequest) {
  if (req.body === null) {
    return NextResponse.next();
  }
  const reader = req.body.getReader();
  const broker = new RequestBroker(/* holder */);
  const redux = new Redux(reader, broker);
  const stream = new ReadableStream(redux);
  return new Response(
    stream,
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}