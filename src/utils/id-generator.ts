import { ulid, decodeTime } from "ulid";

export class IdGeneratorManager {
    private constructor(public readonly id: string) {}

    static generate(): IdGeneratorManager {
        return new IdGeneratorManager(ulid());
    }

    static from(newId: string): IdGeneratorManager {
        const igm = new IdGeneratorManager(newId);
        if (!igm.validate()) throw new Error('Malformed ID');
        return igm;
    }

    private validate(): boolean {
        try {
            decodeTime(this.id);
        } catch(e) {
            return false;
        }

        return true;
    }

    getDate(): Date {
        return new Date(decodeTime(this.id));
    }
}
