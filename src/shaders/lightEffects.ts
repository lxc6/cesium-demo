// 定义光效相关着色器配置接口，包含片段着色器代码

export const getBloomShader = () => {
    return `
			uniform sampler2D colorTexture;
			uniform float intensity;
			uniform bool glowOnly;
			varying vec2 v_textureCoordinates;
			void main() {
				vec4 color = texture2D(colorTexture, v_textureCoordinates);
				vec3 rgb = color.rgb;
				float brightness = (rgb.r + rgb.g + rgb.b) / 3.0;
				vec3 glow = rgb * brightness * intensity;
				gl_FragColor = glowOnly ? vec4(glow, 1.0) : vec4(rgb + glow, 1.0);
			}
		`;
};
