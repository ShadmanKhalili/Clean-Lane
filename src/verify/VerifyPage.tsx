import React from 'react';
import type { PitchRoute } from '../live/routes';

/** Placeholder — implemented in the verification pass. */
export const VerifyPage: React.FC<{ route: Extract<PitchRoute, { kind: 'verify-lot' | 'verify-live' }> }> = () => <div className="p-8">Verify</div>;
export default VerifyPage;
