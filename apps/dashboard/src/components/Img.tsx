import { resolveFileUrl } from '../lib/api';

/** Img wrapper that resolves /api/files/... URLs to the API domain */
export function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} src={resolveFileUrl(props.src)} />;
}
