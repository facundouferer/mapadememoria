const BASE_URL = import.meta.env.BASE_URL;
const BASE_PATH = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

const isAbsoluteUrl = (value: string): boolean => /^(?:[a-z]+:)?\/\//i.test(value);

export const withBase = (path: string): string => {
	if (!path || path === '/') {
		return BASE_URL;
	}

	if (isAbsoluteUrl(path) || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('#')) {
		return path;
	}

	const trimmedBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${trimmedBase}${normalizedPath}`;
};

export const stripBase = (pathname: string): string => {
	if (!BASE_PATH || BASE_PATH === '/') {
		return pathname || '/';
	}

	if (!pathname.startsWith(BASE_PATH)) {
		return pathname || '/';
	}

	const stripped = pathname.slice(BASE_PATH.length);
	if (!stripped || stripped === '/') {
		return '/';
	}

	return stripped.startsWith('/') ? stripped : `/${stripped}`;
};
