{{- define "civic-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "civic-app.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "civic-app.labels" -}}
helm.sh/chart: {{ include "civic-app.chart" . }}
{{ include "civic-app.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "civic-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "civic-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "civic-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "civic-app.backendName" -}}
{{- printf "%s-backend" (include "civic-app.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "civic-app.backendServiceName" -}}
{{- include "civic-app.backendName" . -}}
{{- end -}}

{{- define "civic-app.frontendName" -}}
{{- printf "%s-frontend" (include "civic-app.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "civic-app.frontendServiceName" -}}
{{- include "civic-app.frontendName" . -}}
{{- end -}}
