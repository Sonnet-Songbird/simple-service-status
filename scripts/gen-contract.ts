import { writeFileSync } from 'node:fs'
import { stringify } from 'yaml'

const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'service-status-notice API', version: '1.0.0' },
  paths: {
    '/notice': {
      get: {
        summary: 'Full-page downtime notice (reverse-proxy fallback)',
        parameters: [
          { name: 'service', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Always 200; body is a self-contained HTML page.' },
        },
      },
    },
    '/api/v1/status': {
      get: {
        summary: 'Direct status lookup',
        parameters: [
          { name: 'service', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    service: {
                      type: 'object',
                      properties: { slug: { type: 'string' }, displayName: { type: 'string' } },
                      required: ['slug', 'displayName'],
                    },
                    state: { type: 'string', enum: ['scheduled_maintenance', 'operational_unknown'] },
                    activeSchedule: { $ref: '#/components/schemas/ScheduleDto', nullable: true },
                    upcomingSchedule: { $ref: '#/components/schemas/ScheduleDto', nullable: true },
                    generatedAt: { type: 'integer' },
                  },
                  required: ['service', 'state', 'activeSchedule', 'upcomingSchedule', 'generatedAt'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ErrorResponse' },
          '404': { $ref: '#/components/responses/ErrorResponse' },
          '429': { $ref: '#/components/responses/ErrorResponse' },
        },
      },
    },
    '/widget/v1/widget.js': {
      get: {
        summary: 'Embeddable status widget loader',
        responses: { '200': { description: 'application/javascript' } },
      },
    },
  },
  components: {
    schemas: {
      ScheduleDto: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          startsAt: { type: 'integer' },
          endsAt: { type: 'integer' },
          noticeMessage: { type: 'string' },
        },
        required: ['id', 'startsAt', 'endsAt', 'noticeMessage'],
      },
      ErrorResponseDto: {
        type: 'object',
        properties: {
          error: { type: 'string', enum: ['invalid_request', 'service_not_found', 'rate_limited'] },
          message: { type: 'string' },
        },
        required: ['error', 'message'],
      },
    },
    responses: {
      ErrorResponse: {
        description: 'Error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponseDto' } } },
      },
    },
  },
}

writeFileSync('docs/contract/openapi.yaml', stringify(openApiDocument))
console.log('wrote docs/contract/openapi.yaml')
