export interface ServerDefinition {
  id: string;
  code: string;
  name: string;
  region: string;
  continent: 'Europe' | 'Americas' | 'Asia-Pacific' | 'International';
  basePing: number;
}

export const SERVERS_LIST: ServerDefinition[] = [
  { id: 'srv_eu01', code: 'EU01', name: 'Europe Central', region: 'Frankfurt, DE', continent: 'Europe', basePing: 18 },
  { id: 'srv_eng02', code: 'ENG02', name: 'England Premier', region: 'London, UK', continent: 'Europe', basePing: 14 },
  { id: 'srv_ger03', code: 'GER03', name: 'Germany Bundesliga', region: 'Munich, DE', continent: 'Europe', basePing: 19 },
  { id: 'srv_esp04', code: 'ESP04', name: 'Spain Primera', region: 'Madrid, ES', continent: 'Europe', basePing: 22 },
  { id: 'srv_ita05', code: 'ITA05', name: 'Italy Calcio', region: 'Milan, IT', continent: 'Europe', basePing: 24 },
  { id: 'srv_fra06', code: 'FRA06', name: 'France Ligue', region: 'Paris, FR', continent: 'Europe', basePing: 16 },
  { id: 'srv_nld07', code: 'NLD07', name: 'Netherlands Eredivisie', region: 'Amsterdam, NL', continent: 'Europe', basePing: 15 },
  { id: 'srv_prt08', code: 'PRT08', name: 'Portugal Primeira', region: 'Lisbon, PT', continent: 'Europe', basePing: 27 },
  { id: 'srv_bra09', code: 'BRA09', name: 'Brazil Série A', region: 'São Paulo, BR', continent: 'Americas', basePing: 85 },
  { id: 'srv_arg10', code: 'ARG10', name: 'Argentina Primera', region: 'Buenos Aires, AR', continent: 'Americas', basePing: 92 },
  { id: 'srv_usa11', code: 'USA11', name: 'North America East', region: 'New York, US', continent: 'Americas', basePing: 65 },
  { id: 'srv_jpn12', code: 'JPN12', name: 'Japan J-League', region: 'Tokyo, JP', continent: 'Asia-Pacific', basePing: 110 },
  { id: 'srv_tur13', code: 'TUR13', name: 'Turkey Süper Lig', region: 'Istanbul, TR', continent: 'Europe', basePing: 34 },
  { id: 'srv_bel14', code: 'BEL14', name: 'Belgium Pro League', region: 'Brussels, BE', continent: 'Europe', basePing: 17 },
  { id: 'srv_sco15', code: 'SCO15', name: 'Scotland Premiership', region: 'Glasgow, UK', continent: 'Europe', basePing: 19 },
  { id: 'srv_sui16', code: 'SUI16', name: 'Switzerland Super', region: 'Zurich, CH', continent: 'Europe', basePing: 21 },
  { id: 'srv_aut17', code: 'AUT17', name: 'Austria Bundesliga', region: 'Vienna, AT', continent: 'Europe', basePing: 23 },
  { id: 'srv_swe18', code: 'SWE18', name: 'Sweden Allsvenskan', region: 'Stockholm, SE', continent: 'Europe', basePing: 28 },
  { id: 'srv_nor19', code: 'NOR19', name: 'Norway Eliteserien', region: 'Oslo, NO', continent: 'Europe', basePing: 29 },
  { id: 'srv_dnk20', code: 'DNK20', name: 'Denmark Superliga', region: 'Copenhagen, DK', continent: 'Europe', basePing: 25 },
  { id: 'srv_pol21', code: 'POL21', name: 'Poland Ekstraklasa', region: 'Warsaw, PL', continent: 'Europe', basePing: 26 },
  { id: 'srv_gre22', code: 'GRE22', name: 'Greece Super League', region: 'Athens, GR', continent: 'Europe', basePing: 38 },
  { id: 'srv_cro23', code: 'CRO23', name: 'Croatia HNL', region: 'Zagreb, HR', continent: 'Europe', basePing: 31 },
  { id: 'srv_cze24', code: 'CZE24', name: 'Czech First League', region: 'Prague, CZ', continent: 'Europe', basePing: 24 },
  { id: 'srv_mex25', code: 'MEX25', name: 'Mexico Liga Premier', region: 'Mexico City, MX', continent: 'Americas', basePing: 88 },
  { id: 'srv_kor26', code: 'KOR26', name: 'Korea K-League', region: 'Seoul, KR', continent: 'Asia-Pacific', basePing: 115 },
  { id: 'srv_aus27', code: 'AUS27', name: 'Australia A-League', region: 'Sydney, AU', continent: 'Asia-Pacific', basePing: 145 },
  { id: 'srv_sau28', code: 'SAU28', name: 'Saudi Pro Circuit', region: 'Riyadh, SA', continent: 'International', basePing: 55 },
  { id: 'srv_rsa29', code: 'RSA29', name: 'South Africa Premiership', region: 'Johannesburg, ZA', continent: 'International', basePing: 130 },
  { id: 'srv_wld30', code: 'WLD30', name: 'World Champions Cup', region: 'Global Elite, INTL', continent: 'International', basePing: 35 },
];
