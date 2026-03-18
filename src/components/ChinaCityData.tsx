// Comprehensive China city-to-province mapping
// Cities are grouped by province for easy lookup

export interface CityEntry {
  city: string;
  province: string;
}

const CHINA_CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Guangdong': [
    'Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan', 'Zhuhai', 'Huizhou',
    'Jiangmen', 'Shantou', 'Zhanjiang', 'Zhaoqing', 'Maoming', 'Yangjiang', 'Meizhou',
    'Shaoguan', 'Qingyuan', 'Jieyang', 'Chaozhou', 'Heyuan', 'Yunfu', 'Shanwei',
  ],
  'Zhejiang': [
    'Hangzhou', 'Ningbo', 'Wenzhou', 'Yiwu', 'Jinhua', 'Taizhou', 'Shaoxing',
    'Jiaxing', 'Huzhou', 'Quzhou', 'Zhoushan', 'Lishui',
  ],
  'Jiangsu': [
    'Nanjing', 'Suzhou', 'Wuxi', 'Changzhou', 'Nantong', 'Yangzhou', 'Xuzhou',
    'Yancheng', 'Lianyungang', 'Huaian', 'Zhenjiang', 'Taizhou', 'Suqian',
  ],
  'Shandong': [
    'Qingdao', 'Jinan', 'Yantai', 'Weihai', 'Zibo', 'Weifang', 'Linyi',
    'Jining', 'Taian', 'Dongying', 'Heze', 'Dezhou', 'Binzhou', 'Liaocheng',
    'Rizhao', 'Zaozhuang',
  ],
  'Fujian': [
    'Fuzhou', 'Xiamen', 'Quanzhou', 'Zhangzhou', 'Putian', 'Nanping',
    'Longyan', 'Sanming', 'Ningde',
  ],
  'Hebei': [
    'Shijiazhuang', 'Tangshan', 'Baoding', 'Langfang', 'Handan', 'Xingtai',
    'Qinhuangdao', 'Zhangjiakou', 'Chengde', 'Cangzhou', 'Hengshui',
  ],
  'Henan': [
    'Zhengzhou', 'Luoyang', 'Kaifeng', 'Nanyang', 'Xinxiang', 'Anyang',
    'Xuchang', 'Zhoukou', 'Shangqiu', 'Pingdingshan', 'Jiaozuo', 'Puyang',
    'Xinyang', 'Zhumadian',
  ],
  'Hubei': [
    'Wuhan', 'Yichang', 'Xiangyang', 'Jingzhou', 'Huangshi', 'Shiyan',
    'Huanggang', 'Xiaogan', 'Xianning', 'Ezhou', 'Suizhou', 'Enshi',
  ],
  'Hunan': [
    'Changsha', 'Zhuzhou', 'Xiangtan', 'Hengyang', 'Yueyang', 'Changde',
    'Yiyang', 'Loudi', 'Chenzhou', 'Shaoyang', 'Huaihua', 'Yongzhou',
  ],
  'Sichuan': [
    'Chengdu', 'Mianyang', 'Deyang', 'Nanchong', 'Yibin', 'Leshan',
    'Zigong', 'Luzhou', 'Dazhou', 'Suining', 'Guangan', 'Meishan',
    'Neijiang', 'Panzhihua',
  ],
  'Anhui': [
    'Hefei', 'Wuhu', 'Bengbu', 'Anqing', 'Maanshan', 'Huainan', 'Fuyang',
    'Huaibei', 'Tongling', 'Xuancheng', 'Chuzhou', 'Luan', 'Bozhou',
  ],
  'Liaoning': [
    'Shenyang', 'Dalian', 'Anshan', 'Fushun', 'Benxi', 'Dandong',
    'Jinzhou', 'Yingkou', 'Liaoyang', 'Panjin', 'Tieling', 'Chaoyang',
  ],
  'Jiangxi': [
    'Nanchang', 'Ganzhou', 'Jingdezhen', 'Jiujiang', 'Shangrao', 'Fuzhou',
    'Yichun', 'Xinyu', 'Ji\'an', 'Pingxiang', 'Yingtan',
  ],
  'Shaanxi': [
    'Xi\'an', 'Xianyang', 'Baoji', 'Weinan', 'Hanzhong', 'Yulin',
    'Ankang', 'Yan\'an', 'Shangluo', 'Tongchuan',
  ],
  'Guangxi': [
    'Nanning', 'Guilin', 'Liuzhou', 'Beihai', 'Yulin', 'Wuzhou',
    'Guigang', 'Baise', 'Hechi', 'Qinzhou', 'Fangchenggang',
  ],
  'Yunnan': [
    'Kunming', 'Dali', 'Lijiang', 'Qujing', 'Yuxi', 'Baoshan',
    'Zhaotong', 'Pu\'er', 'Lincang',
  ],
  'Guizhou': [
    'Guiyang', 'Zunyi', 'Liupanshui', 'Anshun', 'Bijie', 'Tongren',
  ],
  'Shanxi': [
    'Taiyuan', 'Datong', 'Yangquan', 'Changzhi', 'Jincheng', 'Shuozhou',
    'Jinzhong', 'Yuncheng', 'Xinzhou', 'Linfen', 'Lvliang',
  ],
  'Jilin': [
    'Changchun', 'Jilin', 'Siping', 'Tonghua', 'Baicheng', 'Songyuan',
    'Liaoyuan', 'Baishan', 'Yanbian',
  ],
  'Heilongjiang': [
    'Harbin', 'Daqing', 'Qiqihar', 'Mudanjiang', 'Jiamusi', 'Suihua',
    'Hegang', 'Shuangyashan', 'Jixi', 'Yichun', 'Heihe',
  ],
  'Gansu': [
    'Lanzhou', 'Tianshui', 'Baiyin', 'Wuwei', 'Zhangye', 'Qingyang',
    'Pingliang', 'Longnan', 'Dingxi', 'Jiuquan', 'Jiayuguan',
  ],
  'Inner Mongolia': [
    'Hohhot', 'Baotou', 'Ordos', 'Chifeng', 'Tongliao', 'Hulunbuir',
    'Wuhai', 'Bayannur',
  ],
  'Xinjiang': [
    'Urumqi', 'Karamay', 'Kashgar', 'Aksu', 'Hotan', 'Turpan',
    'Korla', 'Yining',
  ],
  'Hainan': [
    'Haikou', 'Sanya', 'Danzhou', 'Wanning', 'Qionghai', 'Wenchang',
  ],
  'Ningxia': [
    'Yinchuan', 'Shizuishan', 'Wuzhong', 'Guyuan', 'Zhongwei',
  ],
  'Qinghai': [
    'Xining', 'Haidong', 'Haixi', 'Haibei',
  ],
  'Tibet': [
    'Lhasa', 'Shigatse', 'Chamdo', 'Nyingchi', 'Shannan',
  ],
  // Municipalities (province-level cities)
  'Beijing': ['Beijing'],
  'Shanghai': ['Shanghai'],
  'Tianjin': ['Tianjin'],
  'Chongqing': ['Chongqing'],
  // Special Administrative Regions
  'Hong Kong': ['Hong Kong'],
  'Macau': ['Macau'],
};

// Flat list of all city entries
export const CHINA_CITY_LIST: CityEntry[] = Object.entries(CHINA_CITIES_BY_PROVINCE).flatMap(
  ([province, cities]) => cities.map(city => ({ city, province }))
);

// Get province for a given city
export function getProvinceForCity(cityName: string): string {
  const entry = CHINA_CITY_LIST.find(c => c.city === cityName);
  return entry?.province || '';
}

// Get all unique provinces
export const CHINA_PROVINCES: string[] = Object.keys(CHINA_CITIES_BY_PROVINCE).sort();

// Get cities for a given province
export function getCitiesForProvince(province: string): string[] {
  return CHINA_CITIES_BY_PROVINCE[province] || [];
}
