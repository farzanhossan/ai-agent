import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ENV } from './env';

function filterInternalRoutes(doc: OpenAPIObject, tag) {
  const publicDoc = structuredClone(doc);
  const paths: PathsObject = {};
  Object.entries(publicDoc.paths).map(([k, path]) => {
    if (k.includes(`/${tag}/`)) {
      paths[k] = path;
    }
  });
  publicDoc.paths = paths;
  return publicDoc;
}

const defaultSwaggerOpts = {
  swaggerOptions: {
    docExpansion: false,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
};

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle(ENV.api.API_TITLE)
    .setDescription(ENV.api.API_DESCRIPTION)
    .setVersion(ENV.api.API_VERSION)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  const webDoc = filterInternalRoutes(document, 'web');
  const internalDoc = filterInternalRoutes(document, 'internal');
  SwaggerModule.setup('/docs', app, document, defaultSwaggerOpts);
  SwaggerModule.setup('/docs/web', app, webDoc, defaultSwaggerOpts);
  SwaggerModule.setup('/docs/internal', app, internalDoc, defaultSwaggerOpts);
}
