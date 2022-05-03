import { NextRequest, NextResponse } from 'next/server';
import Database from '../../mongo/multiplexer';
import Multiplexer from './request-multiplexer';
import Sink from './request-sink';
import Source from './response-source';

/** API */
export default function middleware(req: NextRequest) {
  if (req.body === null) {
    return NextResponse.next();
  }
  const multiplexer = new Multiplexer(
    // register consumers
    Database.create()
  );

  req.body.pipeTo(
    new WritableStream(new Sink(multiplexer))
  );

  return new Response(
    new ReadableStream(
      new Source(multiplexer)
    ),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}