export const fixedOrder = (sortToTop, key = (x) => x) => (a, b) => {
	const ka = key(a);
	const kb = key(b);
	if (ka === kb) return 0;
	const na = sortToTop[ka];
	const nb = sortToTop[kb];
	if (na !== undefined && nb === undefined) return -1;
	if (na === undefined && nb !== undefined) return 1;
	if (na === undefined && nb === undefined) return ka < kb ? -1 : 1;
	return na < nb ? -1 : 1;
};
