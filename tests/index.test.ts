import { describe, expect, test } from "vitest";
import libnexa from "../src/index";

describe('#versionGuard', function() {
  test('global._libnexa_ver should be defined', () => {
    expect(global._libnexa_ver).toBe(libnexa.version);
  });

  test('throw an error if version is already defined', () => {
    expect(() => libnexa.versionGuard('version')).toThrow('More than one instance of libnexa');
  });
});