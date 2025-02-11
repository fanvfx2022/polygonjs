import jscad from '@jscad/modeling';

export function csgVec2MultScalar(src: jscad.maths.vec2.Vec2, scalar: number) {
	src[0] *= scalar;
	src[1] *= scalar;
}

export function csgVec2ToJSON(src: jscad.maths.vec2.Vec2) {
	return src;
}
export function csgVec2sToJSON(src: jscad.maths.vec2.Vec2[]) {
	return src.map((v) => csgVec2ToJSON(v));
}
