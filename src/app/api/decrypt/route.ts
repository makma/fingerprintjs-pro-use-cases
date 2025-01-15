import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { decryptSealedResult } from '../../../server/decryptSealedResult';

export type DecryptPayload = {
  sealedResult: string;
};

export type DecryptResponse = EventResponse;

export async function POST(request: Request) {
  try {
    const sealedData = ((await request.json()) as DecryptPayload).sealedResult;
    const data = await decryptSealedResult(sealedData);
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({ error: e }, { status: 500, statusText: String(e) });
  }
}
