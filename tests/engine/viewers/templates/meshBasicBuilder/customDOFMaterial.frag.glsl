
uniform float mNear;
uniform float mFar;

varying float vViewZDepth;

// INSERT DEFINES



// /MAT/meshBasicBuilder1/param1
uniform vec3 v_POLY_param_myCustomVec;

// /MAT/meshBasicBuilder1/globals1
varying vec3 v_POLY_globals1_position;





void main() {

	float color = 1.0 - smoothstep( mNear, mFar, vViewZDepth );
	gl_FragColor = vec4( vec3( color ), 1.0 );
	vec4 diffuseColor = gl_FragColor;

	// INSERT BODY



	// /MAT/meshBasicBuilder1/param1
	vec3 v_POLY_param1_val = v_POLY_param_myCustomVec;
	
	// /MAT/meshBasicBuilder1/add1
	vec3 v_POLY_add1_sum = (v_POLY_globals1_position + v_POLY_param1_val + vec3(0.0, 0.0, 0.0));
	
	// /MAT/meshBasicBuilder1/output1
	diffuseColor.xyz = v_POLY_add1_sum;




	gl_FragColor.a = diffuseColor.a;
}
