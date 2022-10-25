export const anzahlWuerfel = 5;
export const minAnzahlSpiele = 1;
export const maxAnzahlSpiele = 6;

export type Feld = null | 0 | number;
export const ohneEingabe: Feld = null;
export const gestrichen: Feld = 0;

const getErlaubteWerteBeiObererBlock = (wert: number): readonly Feld[] => {
  return new Array(anzahlWuerfel)
    .fill(null)
    .map((_, index) => (index + 1) * wert);
};

export const erlaubtBeiEinser = getErlaubteWerteBeiObererBlock(1);
export const erlaubtBeiZweier = getErlaubteWerteBeiObererBlock(2);
export const erlaubtBeiDreier = getErlaubteWerteBeiObererBlock(3);
export const erlaubtBeiVierer = getErlaubteWerteBeiObererBlock(4);
export const erlaubtBeiFuenfer = getErlaubteWerteBeiObererBlock(5);
export const erlaubtBeiSechser = getErlaubteWerteBeiObererBlock(6);

export const erlaubtBeiFullHouse: readonly Feld[] = [25];
export const erlaubtBeiKleineStrasse: readonly Feld[] = [30];
export const erlaubtBeiGrosseStrasse: readonly Feld[] = [40];
export const erlaubtBeiKnieFell: readonly Feld[] = [50];

export const getFeldValue = (feld: Feld): number => {
  return typeof feld === 'number' ? feld : 0;
};
