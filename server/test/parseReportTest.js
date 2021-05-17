const assert = require("assert");
const parseReport = require('../util/parseReport');

describe("parseReport Test Suit", () => {
  it("Test parseReport with valid Report", () => {
    const report = {
      uuid: "123456789012345678901234567890ab",
      isVirtual: false,
      hostname: "test-debian",
      platform: "linux",
      ram: {
        total: 8000000000,
        free: 2000000000,
      },
      cpu: 30,
      network: [
        { tx_sec: 383.0439223697651, rx_sec: 383.0439223697651 },
        { tx_sec: 98063.32992849847, rx_sec: 96748.72318692543 },
      ],
      reporterVersion: 0.12,
      disks: [
        {fs: 'C:', type: 'NTFS', size: 499461910528, used: 316761124864, available: 182700785664, use: 63.42, mount: 'C:'},
        {fs: 'D:', type: 'NTFS', size: 3000591446016, used: 1826259214336, available: 1174332231680, use: 60.86, mount: 'D:'},
        {fs: 'X:', type: 'NTFS', size: 7997210226688, used: 3803645599744, available: 4193564626944, use: 47.56, mount: 'X:'},
        {fs: 'maliciousText', type: 'maliciousFilesystem', size: 'troll', used: 'lolmelting', available: 'yourmom', use: '13.37', mount: 'xornet:'}
      ],
      uptime: 300,
      reporterUptime: 200,
      timestamp: 1621176090,
    }

    const machinePings = new Map([["123456789012345678901234567890ab", 30]]);

    const actualReport = parseReport(report, 0.12, machinePings);

    const expectedReport = {
      uuid: '123456789012345678901234567890ab',
      isVirtual: false,
      hostname: 'test-debian',
      platform: 'linux',
      ram: { total: 7.45, free: 1.86, used: 5.59 },
      cpu: 30,
      network: { totalInterfaces: 2, TxSec: 0.79, RxSec: 0.78 },
      reporterVersion: 0.12,
      disks: [
        {fs: 'C:', type: 'NTFS', size: 465.16, used: 295.01, available: 170.15, use: 63.42, mount: 'C:'},
        {fs: 'D:', type: 'NTFS', size: 2794.52, used: 1700.84, available: 1093.68, use: 60.86, mount: 'D:'},
        {fs: 'X:', type: 'NTFS', size: 7447.98, used: 3542.42, available: 3905.56, use: 47.56, mount: 'X:'},
        {fs: 'maliciousText', type: 'maliciousFilesystem', size: 'troll', used: 'lolmelting', available: 'yourmom', use: '13.37', mount: 'xornet:'}
      ],
      uptime: { pure: 300, formatted: '0d 0h 5m 0s' },
      reporterUptime: 200,
      timestamp: 1621176090,
      rogue: false,
      ping: 30,
    }

    assert.deepStrictEqual(actualReport, expectedReport);
  })
})