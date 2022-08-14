precision highp float;
precision highp int;
uniform int MAX_STEPS;
uniform float MAX_DIST;
uniform float SURF_DIST;
#define ZERO 0
#include <common>
float dot2( in vec2 v ) { return dot(v,v); }
float dot2( in vec3 v ) { return dot(v,v); }
float ndot( in vec2 a, in vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdSphere( vec3 p, float s )
{
	return length(p)-s;
}
float sdBox( vec3 p, vec3 b )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float sdRoundBox( vec3 p, vec3 b, float r )
{
	vec3 q = abs(p) - b;
	return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}
float sdBoxFrame( vec3 p, vec3 b, float e )
{
		p = abs(p  )-b;
	vec3 q = abs(p+e)-e;
	return min(min(
		length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
		length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
		length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}
float sdPlane( vec3 p, vec3 n, float h )
{
	return dot(p,n) + h;
}
float sdTorus( vec3 p, vec2 t )
{
	vec2 q = vec2(length(p.xz)-t.x,p.y);
	return length(q)-t.y;
}
float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb)
{
	p.x = abs(p.x);
	float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
	return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}
float sdLink( vec3 p, float le, float r1, float r2 )
{
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}
float sdRhombus(vec3 p, float la, float lb, float h, float ra)
{
  p = abs(p);
  vec2 b = vec2(la,lb);
  float f = clamp( (ndot(b,b-2.0*p.xz))/dot(b,b), -1.0, 1.0 );
  vec2 q = vec2(length(p.xz-0.5*b*vec2(1.0-f,1.0+f))*sign(p.x*b.y+p.z*b.x-b.x*b.y)-ra, p.y-h);
  return min(max(q.x,q.y),0.0) + length(max(q,0.0));
}
float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;
    
  float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
  return length(vec3(q.x,q.y-s+k,q.z-k)); 
}
float SDFUnion( float d1, float d2 ) { return min(d1,d2); }
float SDFSubtract( float d1, float d2 ) { return max(-d1,d2); }
float SDFIntersect( float d1, float d2 ) { return max(d1,d2); }
float SDFSmoothUnion( float d1, float d2, float k ) {
	float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) - k*h*(1.0-h);
}
float SDFSmoothSubtract( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
	return mix( d2, -d1, h ) + k*h*(1.0-h);
}
float SDFSmoothIntersect( float d1, float d2, float k ) {
	float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
	return mix( d2, d1, h ) + k*h*(1.0-h);
}
const int _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1 = 147;
uniform float time;
uniform sampler2D v_POLY_texture_envTexture1;
#include <lightmap_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
varying vec3 vPw;
#if NUM_SPOT_LIGHTS > 0
	struct SpotLightRayMarching {
		vec3 worldPos;
	};
	uniform SpotLightRayMarching spotLightsRayMarching[ NUM_SPOT_LIGHTS ];
#endif
struct SDFContext {
	float d;
	int matId;
};
SDFContext DefaultSDFContext(){
	return SDFContext( 0.0, 0 );
}
int DefaultSDFMaterial(){
	return 0;
}
SDFContext GetDist(vec3 p) {
	SDFContext sdfContext = SDFContext(0.0, 0);
	vec3 v_POLY_globals1_position = p;
	float v_POLY_globals1_time = time;
	
	float v_POLY_SDFSphere1_float = sdSphere(v_POLY_globals1_position - vec3(0.0, 0.0, 0.0), v_POLY_globals1_time);
	
	SDFContext v_POLY_SDFContext1_SDFContext = SDFContext(v_POLY_SDFSphere1_float, _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1);
	
	sdfContext = v_POLY_SDFContext1_SDFContext;
	
	return sdfContext;
}
SDFContext RayMarch(vec3 ro, vec3 rd) {
	SDFContext dO = SDFContext(0.,0);
	for(int i=0; i<MAX_STEPS; i++) {
		vec3 p = ro + rd*dO.d;
		SDFContext sdfContext = GetDist(p);
		dO.d += sdfContext.d;
		dO.matId = sdfContext.matId;
		if(dO.d>MAX_DIST || sdfContext.d<SURF_DIST) break;
	}
	return dO;
}
vec3 GetNormal(vec3 p) {
	SDFContext sdfContext = GetDist(p);
	vec2 e = vec2(.01, 0);
	vec3 n = sdfContext.d - vec3(
		GetDist(p-e.xyy).d,
		GetDist(p-e.yxy).d,
		GetDist(p-e.yyx).d);
	return normalize(n);
}
vec3 GetLight(vec3 p, vec3 n) {
	#if NUM_SPOT_LIGHTS > 0
		vec3 dif = vec3(0.,0.,0.);
		SpotLightRayMarching spotLightRayMarching;
		SpotLight spotLight;
		vec3 lightPos,lightCol, l;
		float lighDif;
		SDFContext sdfContext;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
			spotLightRayMarching = spotLightsRayMarching[ i ];
			spotLight = spotLights[ i ];
			lightPos = spotLightRayMarching.worldPos;
			lightCol = spotLight.color;
			l = normalize(lightPos-p);
			lighDif = clamp(dot(n, l), 0., 1.);
			sdfContext = RayMarch(p+n*SURF_DIST*2., l);
			if(sdfContext.d<length(lightPos-p)) lighDif *= .1;
			dif += lightCol * lighDif;
		}
		#pragma unroll_loop_end
		return dif;
	#else
		return vec3(1.0, 1.0, 1.0);
	#endif
}
float calcSoftshadow( in vec3 ro, in vec3 rd, float mint, float maxt, float k )
{
	float res = 1.0;
	float ph = 1e20;
	for( float t=mint; t<maxt; )
	{
		float h = GetDist(ro + rd*t).d;
		if( h<0.001 )
			return 0.0;
		float y = h*h/(2.0*ph);
		float d = sqrt(h*h-y*y);
		res = min( res, k*d/max(0.0,t-y) );
		ph = h;
		t += h;
	}
	return res;
}
vec3 applyMaterial(vec3 p, vec3 n, vec3 rayDir, vec3 col, int mat){
	vec3 v_POLY_constant1_val = vec3(1.0, 1.0, 1.0);
	
	if(mat == _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1){
		col *= v_POLY_constant1_val;
		vec3 r = normalize(reflect(rayDir, n));
		vec2 uv = vec2( atan( -r.z, -r.x ) * RECIPROCAL_PI2 + 0.5, r.y * 0.5 + 0.5 );
		float fresnel = pow(1.-dot(normalize(cameraPosition), n), 5.0);
		float fresnelFactor = (1.-0.0) + 0.0*fresnel;
		vec3 env = texture2D(v_POLY_texture_envTexture1, uv).rgb * vec3(1.0, 1.0, 1.0) * 1.0 * fresnelFactor;
		col += env;
	}
	
	return col;
}
vec4 applyShading(vec3 rayOrigin, vec3 rayDir, SDFContext sdfContext){
	vec3 p = rayOrigin + rayDir * sdfContext.d;
	vec3 n = GetNormal(p);
	vec3 diffuse = GetLight(p, n);
	vec3 col = applyMaterial(p, n, rayDir, diffuse, sdfContext.matId);
		
	col = pow( col, vec3(0.4545) ); 
	return vec4(col, 1.);
}
void main()	{
	vec3 rayDir = normalize(vPw - cameraPosition);
	vec3 rayOrigin = cameraPosition;
	SDFContext sdfContext = RayMarch(rayOrigin, rayDir);
	gl_FragColor = sdfContext.d<MAX_DIST ? applyShading(rayOrigin, rayDir, sdfContext) : vec4(.0,.0,.0,.0);
}