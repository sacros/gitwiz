import * as R from "ramda"

export const nilOrEmpty = R.anyPass([R.isNil, R.isEmpty])
