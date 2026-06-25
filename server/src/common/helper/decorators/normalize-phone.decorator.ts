import { Transform } from 'class-transformer';
import { normalizePhoneToE164 } from '../phone.util';

export function NormalizePhone() {
    return Transform(({ value }) =>
        typeof value === 'string' ? normalizePhoneToE164(value) : value
    );
}
