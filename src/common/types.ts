import type { Network } from "../core/network/network";

export type EndianType = "big" | "little";

/**
 *  Any type that can be used where a numeric value is needed.
 */
export type Numeric = number | bigint;

/**
 *  Any type that can be used where a big number is needed.
 */
export type BigNumberish = string | Numeric;

/**
 *  Any type that can be used where a network is needed.
 */
export type Networkish = string | Network;

/**
 *  Any type that can be used where a Buffer is needed.
 */
export type Bufferish = Buffer | Uint8Array;

