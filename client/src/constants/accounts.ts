export interface Account {
  id: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  normalBalance: 'DR' | 'CR';
  openingBalance: number;
}

export const DEFAULT_ACCOUNTS: Record<string, Account> = {
  "101": {
    "id": "101",
    "name": "ເງິນສົດ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102": {
    "id": "102",
    "name": "ເງິນທະນາຄານ ການຄ້າ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "103": {
    "id": "103",
    "name": "ເຄື່ອງໃນສາງ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "121": {
    "id": "121",
    "name": "ໜີ້ຕ້ອງຮັບ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "241": {
    "id": "241",
    "name": "ອຸປະກອນ ແລະ ເຄື່ອງຈັກຊົງກາເຟ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "301": {
    "id": "301",
    "name": "ທຶນຈົດທະບຽນ",
    "type": "EQUITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "303": {
    "id": "303",
    "name": "ທຶນ",
    "type": "EQUITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "321": {
    "id": "321",
    "name": "ກຳໄລ",
    "type": "EQUITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "322": {
    "id": "322",
    "name": "ຂາດທຶນ",
    "type": "EQUITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "331": {
    "id": "331",
    "name": "ກຳໄລຍົກມາ",
    "type": "EQUITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "332": {
    "id": "332",
    "name": "ຂາດທຶນຍົກມາ",
    "type": "EQUITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "401": {
    "id": "401",
    "name": "ໜີ້ຕ້ອງສົ່ງຜູ້ສະໜອງ",
    "type": "LIABILITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "420": {
    "id": "420",
    "name": "ໜີ້ຕ້ອງສົ່ງພະນັກງານ",
    "type": "LIABILITY",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "601": {
    "id": "601",
    "name": "ເມັດກາເຟ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "602": {
    "id": "602",
    "name": "ນົມ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "603": {
    "id": "603",
    "name": "ນ້ຳກ້ອນ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "604": {
    "id": "604",
    "name": "ເຄື່ອງປຸງ ແລະ ວັດຖຸດິບ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "605": {
    "id": "605",
    "name": "ວັດຖຸດິບສິ້ນເປືອງ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "606": {
    "id": "606",
    "name": "ນ້ຳດື່ມ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "607": {
    "id": "607",
    "name": "ວັດຖຸປະກອບ (ພາຊະນະບັນຈຸ)",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "611": {
    "id": "611",
    "name": "ຄ່າເຊົ່າ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "612": {
    "id": "612",
    "name": "ຄ່າໂຄສະນາ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "613": {
    "id": "613",
    "name": "ຄ່າທຳນຽມ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "614": {
    "id": "614",
    "name": "ຄ່າໂທລະສັບ ແລະ ອິນເຕີເນັດ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "615": {
    "id": "615",
    "name": "ຄ່ານ້ຳ ຄ່າໄຟ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "616": {
    "id": "616",
    "name": "ຄ່າຂົນສົ່ງ ແລະ ຄ່າເດີນທາງ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "617": {
    "id": "617",
    "name": "ລາຍຈ່າຍບໍລິຫານທົ່ວໄປ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "621": {
    "id": "621",
    "name": "ຄ່າອາຫານ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "631": {
    "id": "631",
    "name": "ຄ່າພະນັກງານ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "681": {
    "id": "681",
    "name": "ຄ່າຫຼຸ້ຍຫ້ຽນ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "691": {
    "id": "691",
    "name": "ປັນຜົນ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "707": {
    "id": "707",
    "name": "ລາຍຮັບຈາກການຂາຍ",
    "type": "REVENUE",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "708": {
    "id": "708",
    "name": "ລາຍຮັບຈາກຂາຍເສື້ອ",
    "type": "REVENUE",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "2412": {
    "id": "2412",
    "name": "ເຟີນິເຈີ ແລະ ອຸປະກອນຮ້ານ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "2413": {
    "id": "2413",
    "name": "ອຸປະກອນຊົງກາເຟ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "2414": {
    "id": "2414",
    "name": "ພາຫະນະ (ລົດຂາຍກາເຟ)",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.2": {
    "id": "102.2",
    "name": "ເງິນທະນາຄານ ມາຣູຮານ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.3": {
    "id": "102.3",
    "name": "ເງິນທະນາຄານ LDB",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.4": {
    "id": "102.4",
    "name": "ເງິນທະນາຄານ JDB",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.5": {
    "id": "102.5",
    "name": "ເງິນທະນາຄານອິນໂດຈີນ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.6": {
    "id": "102.6",
    "name": "ເງິນທະນາຄານລາວຝຣັ່ງ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.7": {
    "id": "102.7",
    "name": "ເງິນທະນາຄານລາວຫວຽດ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.8": {
    "id": "102.8",
    "name": "EGETS",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "102.9": {
    "id": "102.9",
    "name": "Foodpanda",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "2413.1": {
    "id": "2413.1",
    "name": "ເຄື່ອງໃຊ້ໄຟຟ້າ ແລະ ຊັບສິນຄ້າຍຄືກັນ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "2413.2": {
    "id": "2413.2",
    "name": "ເຄື່ອງໃຊ້ພາຍໃນຮ້ານ",
    "type": "ASSET",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "707.1": {
    "id": "707.1",
    "name": "ລາຍຮັບອອກງານ",
    "type": "REVENUE",
    "normalBalance": "CR",
    "openingBalance": 0
  },
  "601.1": {
    "id": "601.1",
    "name": "ມັດຊະ",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "604.1": {
    "id": "604.1",
    "name": "ເຄື່ອງປຸງ ແລະ ວັດຖຸດິບ ງົບ IF&CUP",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "607.1": {
    "id": "607.1",
    "name": "ວັດຖຸປະກອບເສື້ອ ງົບ IF&CUP",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "607.2": {
    "id": "607.2",
    "name": "ວັດຖຸປະກອບ (ພາຊະນະບັນຈຸ) ງົບ IF&CUP",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "605.1": {
    "id": "605.1",
    "name": "ວັດຖຸດິບສິ້ນເປືອງ ງົບ IF&CUP",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "613.1": {
    "id": "613.1",
    "name": "ຫັກຍອດຂາຍໃຫ້ E-GETS",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "613.2": {
    "id": "613.2",
    "name": "ຫັກຍອດຂາຍໃຫ້ Foodpanda",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "616.1": {
    "id": "616.1",
    "name": "ຄ່ານ້ຳມັນສົ່ງອໍເດີ້",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  },
  "617.1": {
    "id": "617.1",
    "name": "ລາຍຈ່າຍບໍລິຫານທົ່ວໄປ IF&CUP",
    "type": "EXPENSE",
    "normalBalance": "DR",
    "openingBalance": 0
  }
};
