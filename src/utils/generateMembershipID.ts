import { randomBytes } from "crypto";

const generateMembershipID = () => {
    return randomBytes(64).toString('hex')
}

export default generateMembershipID