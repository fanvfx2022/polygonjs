import {LngLatLike, Vector2Like} from '../../types/GlobalTypes';
import {Vector3} from 'three';
import {Triangle} from 'three';
import {Easing} from './Easing';
import {CoreType} from '../Type';

const RAD_DEG_RATIO = Math.PI / 180;
const RAND_A = 12.9898;
const RAND_B = 78.233;
const RAND_C = 43758.5453;

export function degToRad(deg: number): number {
	return deg * RAD_DEG_RATIO;
}
export function radToDeg(rad: number): number {
	return rad / RAD_DEG_RATIO;
}
export class CoreMath {
	static Easing = Easing; // used in expressins

	static clamp(val: number, min: number, max: number): number {
		if (val < min) {
			return min;
		} else if (val > max) {
			return max;
		} else {
			return val;
		}
	}

	static fit01(val: number, destMin: number, destMax: number): number {
		// const size = max - min;
		// return (val - min) / size;
		return this.fit(val, 0, 1, destMin, destMax);
	}

	static fit(val: number, srcMin: number, srcMax: number, destMin: number, destMax: number): number {
		const src_range = srcMax - srcMin;
		const dest_range = destMax - destMin;

		const r = (val - srcMin) / src_range;
		return r * dest_range + destMin;
	}
	static fitClamp(val: number, srcMin: number, srcMax: number, destMin: number, destMax: number): number {
		const r = this.fit(val, srcMin, srcMax, destMin, destMax);
		return this.clamp(r, destMin, destMax);
	}
	static blend(num0: number, num1: number, blend: number) {
		return (1 - blend) * num0 + blend * num1;
	}

	static fract = (number: number) => number - Math.floor(number);

	// from threejs glsl rand
	static rand(number: number): number {
		if (CoreType.isNumber(number)) {
			return this.randFloat(number);
		} else {
			return this.randVec2(number);
		}
	}

	static round(number: number, step_size: number): number {
		const steps_count = number / step_size;
		const rounded_steps_count = number < 0 ? Math.ceil(steps_count) : Math.floor(steps_count);
		return rounded_steps_count * step_size;
	}

	static highest_even(number: number): number {
		return 2 * Math.ceil(number * 0.5);
	}

	private static _vec = {x: 0, y: 136574};
	static randFloat(x: number, y: number = 136574): number {
		this._vec.x = x;
		this._vec.y = y;
		return this.randVec2(this._vec);
	}

	static randVec2(uv: Vector2Like) {
		const dt = uv.x * RAND_A + uv.y * RAND_B; //dot( uv.xy, vec2( a,b ) )
		const sn = dt % Math.PI;
		return this.fract(Math.sin(sn) * RAND_C);
	}

	// https://www.movable-type.co.uk/scripts/latlong.html
	static geodesic_distance(lnglat1: LngLatLike, lnglat2: LngLatLike): number {
		var R = 6371e3; // metres
		var d1 = degToRad(lnglat1.lat);
		var d2 = degToRad(lnglat2.lat);
		var ad1 = degToRad(lnglat2.lat - lnglat1.lat);
		var ad2 = degToRad(lnglat2.lng - lnglat1.lng);

		var a =
			Math.sin(ad1 / 2) * Math.sin(ad1 / 2) + Math.cos(d1) * Math.cos(d2) * Math.sin(ad2 / 2) * Math.sin(ad2 / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		var d = R * c;
		return d;
	}

	private static _triangle_mid = new Vector3();
	private static _triangle_mid_to_corner = new Vector3();
	static expand_triangle(triangle: Triangle, margin: number) {
		triangle.getMidpoint(this._triangle_mid);

		// a
		this._triangle_mid_to_corner.copy(triangle.a).sub(this._triangle_mid);
		this._triangle_mid_to_corner.normalize().multiplyScalar(margin);
		triangle.a.add(this._triangle_mid_to_corner);
		// b
		this._triangle_mid_to_corner.copy(triangle.b).sub(this._triangle_mid);
		this._triangle_mid_to_corner.normalize().multiplyScalar(margin);
		triangle.b.add(this._triangle_mid_to_corner);
		// c
		this._triangle_mid_to_corner.copy(triangle.c).sub(this._triangle_mid);
		this._triangle_mid_to_corner.normalize().multiplyScalar(margin);
		triangle.c.add(this._triangle_mid_to_corner);
	}

	static nearestPower2(num: number) {
		return Math.pow(2, Math.ceil(Math.log(num) / Math.log(2)));
	}
	static pow2Inverse(num: number) {
		return Math.log(num) / Math.log(2);
	}
}
