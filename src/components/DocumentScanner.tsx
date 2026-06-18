/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalDocument, Appointment } from "../types";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  FileText, 
  Camera, 
  Sparkles, 
  Paperclip, 
  Plus, 
  Search,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  X,
  Type
} from "lucide-react";

interface DocumentScannerProps {
  documents: MedicalDocument[];
  appointments: Appointment[];
  onAddDocument: (doc: any) => Promise<any>;
  onDeleteDocument: (id: string) => Promise<any>;
  onAnalyzeDocument: (fileName: string, fileType: string, fileDataUrl: string) => Promise<any>;
  onLinkDocument: (docId: string, apptId: string | undefined) => Promise<any>;
  viewOwnerId: string | null;
}

export default function DocumentScanner({
  documents,
  appointments,
  onAddDocument,
  onDeleteDocument,
  onAnalyzeDocument,
  onLinkDocument,
  viewOwnerId
}: DocumentScannerProps) {
  const [tagFilter, setTagFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  
  // Custom interactive mock capture state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string>("");
  const [customFileType, setCustomFileType] = useState<string>("Laboratorio");
  const [selectedApptId, setSelectedApptId] = useState<string>("");
  
  // View file modal
  const [viewingDoc, setViewingDoc] = useState<MedicalDocument | null>(null);

  // Ready-to-scan dummy base64 contents matching common pregnancy documents
  const PRESET_FILES = [
    {
      id: "preset-analitica",
      name: "analitica_segundo_trimestre.png",
      type: "Laboratorio",
      label: "🧪 Receta de Analítica Glucosa (O'Sullivan)",
      desc: "Simula subir un examen de glucosa en ayunas."
    },
    {
      id: "preset-ecografia",
      name: "ecografia_fetal_24_semanas.png",
      type: "Ecografía",
      label: "🤰 Ecografía Prenatal 24 Semanas",
      desc: "Simula un ultrasonido obstétrico morfométrico."
    },
    {
      id: "preset-pediatria",
      name: "control_pediatrico_1er_mes.png",
      type: "Pediatría",
      label: "👶 Carnet Pediátrico Mateo",
      desc: "Simula el alta física o peso/vacunas de un bebé."
    }
  ];

  const takePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Permite elegir entre Cámara o Galería
        promptLabelHeader: "Escanear Documento",
        promptLabelPhoto: "Elegir de Galería",
        promptLabelPicture: "Tomar Foto"
      });

      if (image && image.dataUrl) {
        setCapturedImage(image.dataUrl);
        // Sugerir un nombre basado en la fecha si está vacío
        if (!customFileName) {
          const date = new Date().toLocaleDateString().replace(/\//g, '-');
          setCustomFileName(`Documento_${date}`);
        }
      }
    } catch (e) {
      console.error("Camera error", e);
    }
  };

  const handleScanAction = async () => {
    if (!capturedImage && !selectedPresetFile) return;
    
    setScanning(true);
    setScannedResult(null);

    try {
      let dataUrl = capturedImage;
      let name = customFileName || "Documento_Escaneado";
      let type = customFileType;

      if (!capturedImage && selectedPresetFile) {
        const preset = PRESET_FILES.find(p => p.id === selectedPresetFile)!;
        name = preset.name;
        type = preset.type;
        // Placeholder para presets
        const dummyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        dataUrl = `data:image/png;base64,${dummyPngBase64}`;
      }

      console.log(`Analyzing document: ${name} using full-stack OCR...`);
      // Contact our server-side Gemini OCR engine
      const analyzed = await onAnalyzeDocument(name, type, dataUrl!);
      setScannedResult({
        name,
        type,
        ocrText: analyzed.ocrText,
        extractedMetadata: analyzed.extractedMetadata,
        dataUrl
      });
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  // Keep compatibility with old presets for testing
  const [selectedPresetFile, setSelectedPresetFile] = useState<string | null>(null);

  const handleSaveDocument = async () => {
    if (!scannedResult) return;

    try {
      await onAddDocument({
        name: scannedResult.name,
        type: scannedResult.type,
        fileDataUrl: scannedResult.dataUrl || "/assets/sample_document.png",
        ocrText: scannedResult.ocrText,
        extractedMetadata: scannedResult.extractedMetadata,
        appointmentId: selectedApptId || undefined,
        size: "1.4 MB"
      });

      // Clear scanning workbench
      setScannedResult(null);
      setCapturedImage(null);
      setCustomFileName("");
      setSelectedPresetFile(null);
      setSelectedApptId("");
    } catch (err) {
      console.error(err);
    }
  };

  // Filter listings
  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (d.ocrText && d.ocrText.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (d.extractedMetadata?.doctorName && d.extractedMetadata.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (tagFilter === "ALL") return matchesSearch;
    return d.type === tagFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-serif text-[#2F3E46] font-medium">Bóveda de Expedientes Médicos</h3>
        <p className="text-xs text-[#7A7875] mt-1">Sube y categoriza digitalmente tus recetas, órdenes y ecografías con análisis automático de IA 🌸</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LAUNCHER CAMERA & OCR WORKBENCH (cols 5) */}
        <div className="lg:col-span-5 space-y-6">
          {viewOwnerId ? (
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-[#8C9B73]/10 text-[#5A634D] rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-[#8C9B73]" />
              </div>
              <h4 className="font-serif font-semibold text-md text-[#2F3E46]">Escáner de IA Desactivado</h4>
              <p className="text-xs text-[#7A7875] max-w-sm mx-auto leading-relaxed">
                Como compañero de apoyo de TribuMental, tienes acceso de solo lectura de consentimiento. No puedes subir, escanear o vincular recetas y expedientes médicos en TribuMental.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm">
              <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#8C9B73]" />
                Escáner de Cámara Inteligente
              </h4>

              {/* Custom Interactive Camera Box */}
              <div className="relative aspect-video rounded-3xl bg-[#2F3E46] border-2 border-dashed border-[#8C9B73]/40 overflow-hidden flex flex-col items-center justify-center p-4 group">
                {scanning ? (
                  <>
                    {/* Sweeping Laser Beam Animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#8C9B73] opacity-80 shadow-md animate-laser"></div>
                    <div className="absolute inset-0 bg-[#8C9B73]/10 animate-pulse"></div>
                    <div className="text-center z-10 text-white space-y-2">
                      <Sparkles className="w-10 h-10 text-[#8C9B73] mx-auto animate-spin" />
                      <p className="text-xs font-mono font-bold tracking-widest text-[#F4F1ED]">GEMINI AI OCR EN ACCIÓN</p>
                      <p className="text-[10px] text-[#A3A19E]">Extrayendo diagnósticos, fechas y médicos...</p>
                    </div>
                  </>
                ) : capturedImage ? (
                  <div className="relative w-full h-full">
                    <img src={capturedImage} className="w-full h-full object-cover rounded-2xl opacity-60" alt="Captured" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-2">
                      <CheckCircle className="w-10 h-10 text-[#8C9B73]" />
                      <p className="text-xs font-bold text-white">Imagen capturada</p>
                      <button
                        onClick={() => { setCapturedImage(null); setCustomFileName(""); }}
                        className="text-[10px] bg-rose-500/20 text-rose-200 px-3 py-1 rounded-full border border-rose-500/30 hover:bg-rose-500/40 transition-all"
                      >
                        Cambiar foto
                      </button>
                    </div>
                  </div>
                ) : selectedPresetFile ? (
                  <div className="text-center text-white p-4 space-y-2 z-10">
                    <FileText className="w-12 h-12 text-[#8C9B73] mx-auto" />
                    <p className="text-xs font-bold font-serif text-[#F4F1ED]">{PRESET_FILES.find(p => p.id === selectedPresetFile)?.name}</p>
                    <p className="text-[10px] text-[#A3A19E]">Documento de prueba listo.</p>
                    <button
                      onClick={() => setSelectedPresetFile(null)}
                      className="text-[10px] text-[#8C9B73] underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={takePhoto}
                    className="w-full h-full flex flex-col items-center justify-center text-[#A3A19E] space-y-2 hover:bg-[#8C9B73]/5 transition-all cursor-pointer"
                  >
                    <Camera className="w-10 h-10 mx-auto text-[#8C9B73] group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-semibold text-[#F4F1ED]">Tocar para Escanear</p>
                    <p className="text-[10px] text-[#A3A19E]">Usa tu cámara para capturar el documento físico</p>
                  </button>
                )}

                {/* Laser css styles helper */}
                <style>{`
                  @keyframes laser {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                  }
                  .animate-laser {
                    animation: laser 2.2s infinite ease-in-out;
                  }
                `}</style>
              </div>

              {/* Step 1: File Info (Only shown if photo taken or preset selected) */}
              {(capturedImage || selectedPresetFile) && !scannedResult && (
                <div className="mt-4 space-y-3 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#A3A19E] uppercase flex items-center gap-1">
                      <Type size={12} /> Nombre del documento:
                    </label>
                    <input
                      type="text"
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      placeholder="Ej: Receta Pediatra Mateo"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:outline-none focus:ring-1 focus:ring-[#8C9B73] bg-[#FBF9F4]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#A3A19E] uppercase">Categoría:</label>
                    <div className="flex gap-2">
                      {["Laboratorio", "Ecografía", "Pediatría"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCustomFileType(cat)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                            customFileType === cat
                              ? "bg-[#8C9B73] text-white border-[#8C9B73]"
                              : "bg-white text-[#7A7875] border-[#ECE8E0] hover:bg-[#F4F1ED]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Scan */}
                  <button
                    onClick={handleScanAction}
                    disabled={scanning}
                    className="w-full mt-2 py-3 bg-[#8C9B73] hover:bg-[#7d8c66] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>{scanning ? "Sincronizando con Gemini..." : "Analizar con IA 🌸"}</span>
                  </button>
                </div>
              )}

              {/* Alternative: Preset selection (Only if no image captured) */}
              {!capturedImage && !scannedResult && !selectedPresetFile && (
                <div className="mt-6 border-t border-[#ECE8E0] pt-4">
                  <p className="text-[9px] font-bold text-[#A3A19E] uppercase mb-3">O usa un documento de prueba:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESET_FILES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetFile(p.id);
                          setCustomFileName(p.name);
                          setCustomFileType(p.type);
                        }}
                        className="w-full p-2.5 rounded-xl border border-[#ECE8E0] text-left hover:bg-[#F4F1ED] transition-all flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#8C9B73]/10 flex items-center justify-center text-sm group-hover:bg-[#8C9B73]/20">
                          {p.id.includes('analitica') ? '🧪' : p.id.includes('ecografia') ? '🤰' : '👶'}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#2F3E46]">{p.label}</p>
                          <p className="text-[9px] text-[#7A7875]">{p.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          )}

          {/* OCR RESULTS WORKBENCH BLOCK */}
          {!viewOwnerId && scannedResult && (
            <div className="bg-[#FBF9F4] rounded-[40px] border border-[#ECE8E0] p-5 shadow-sm space-y-4 animate-fadeIn text-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#5A634D] uppercase tracking-wider">
                <CheckCircle className="w-4.5 h-4.5 text-[#8C9B73] shrink-0" />
                <span>Resultados de Análisis OCR de la IA</span>
              </div>

              {/* Extracted Metadata Card */}
              <div className="p-3.5 bg-white border border-[#ECE8E0] rounded-2xl text-xs space-y-2">
                <div className="flex justify-between border-b border-[#ECE8E0] pb-1.5 font-semibold text-[#2F3E46]">
                  <span>Médico / Emisor:</span>
                  <span className="text-[#5A634D]">{scannedResult.extractedMetadata?.doctorName || "Detectando..."}</span>
                </div>
                <div className="flex justify-between border-b border-[#ECE8E0] pb-1.5 font-semibold text-[#2F3E46]">
                  <span>Fecha de Emisión:</span>
                  <span className="text-[#8C9B73] font-mono">{scannedResult.extractedMetadata?.dateOfDocument || "Detectando..."}</span>
                </div>
                <div className="flex justify-between border-b border-[#ECE8E0] pb-1.5 font-semibold text-[#2F3E46]">
                  <span>Paciente:</span>
                  <span className="text-[#7A7875]">{scannedResult.extractedMetadata?.patientName || "Detectando..."}</span>
                </div>
                <div className="pt-1.5">
                  <span className="font-semibold block text-[#8B5E5E]">Resumen de Diagnóstico / Indicaciones:</span>
                  <p className="text-[11px] text-[#7A7875] mt-1 leading-relaxed italic">
                    "{scannedResult.extractedMetadata?.keyFindings}"
                  </p>
                </div>
              </div>

              {/* Link metadata to calendar schedule option */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#A3A19E] uppercase">2. Adjuntar a Cita Existente:</label>
                <select
                  value={selectedApptId}
                  onChange={e => setSelectedApptId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#ECE8E0] text-[#2F3E46] cursor-pointer focus:outline-none"
                >
                  <option value="">-- No adjuntar, guardar libremente --</option>
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.date}] {a.title} ({a.doctor})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-[#A3A19E]">Si lo asocias, este archivo aparecerá en tu agenda bajo esa fecha.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScannedResult(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-[#ECE8E0] hover:bg-[#F4F1ED] bg-white text-[#5A634D]"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleSaveDocument}
                  className="flex-1 py-2 bg-[#8C9B73] hover:bg-[#7d8c66] text-white text-xs font-bold rounded-xl"
                >
                  Archivar en Expediente 📂
                </button>
              </div>
            </div>
          )}
        </div>

        {/* VAULT DIRECTORY SEARCH & LISTINGS (cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm space-y-4">
            {/* Header Search Inputs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#8C9B73]" />
                Directorio de Expedientes ({filteredDocs.length})
              </h4>

              {/* Categories filters */}
              <div className="flex gap-1">
                {["ALL", "Laboratorio", "Ecografía", "Pediatría"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                      tagFilter === tag ? "bg-[#8C9B73] text-white" : "bg-[#F4F1ED] text-[#7A7875] hover:bg-[#eae6e0]"
                    }`}
                  >
                    {tag === "ALL" ? "Todos" : tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A19E]" />
              <input
                type="text"
                placeholder="Busca por médico, tratamiento, hallazgo u OCR..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-[#FBF9F4] text-[#2F3E46]"
              />
            </div>

            {/* Listing Grid */}
            {filteredDocs.length === 0 ? (
              <div className="text-center py-16 text-xs text-[#A3A19E]">
                Ningún documento coincide con la búsqueda o filtros.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => {
                  const linkedAppointment = appointments.find(a => a.id === doc.appointmentId);
                  return (
                    <div 
                      key={doc.id}
                      className="p-4 border border-[#ECE8E0] rounded-3xl bg-white hover:bg-[#FBF9F4] transition-colors flex flex-col justify-between gap-3 relative"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-extrabold uppercase bg-[#F4F1ED] border border-[#ECE8E0] px-1.5 py-0.5 rounded text-[#5A634D]">
                            {doc.type}
                          </span>
                          <span className="text-[8px] font-mono text-[#A3A19E]">{doc.size || "1.0 MB"}</span>
                        </div>

                        <h5 className="text-xs font-semibold text-[#2F3E46] truncate" title={doc.name}>
                          {doc.name}
                        </h5>

                        {/* Extractions metadata summary review */}
                        {doc.extractedMetadata && (
                          <div className="text-[10px] text-[#7A7875] space-y-1 pr-6">
                            <p className="line-clamp-1"><strong className="text-[#5A634D]">Dr: </strong>{doc.extractedMetadata.doctorName}</p>
                            <p className="line-clamp-2 italic text-[#A3A19E] font-light mt-0.5">"{doc.extractedMetadata.keyFindings}"</p>
                          </div>
                        )}

                        {linkedAppointment && (
                          <div className="text-[9px] bg-[#FBF9F4] border border-[#8C9B73]/20 text-[#5A634D] p-1.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3 h-3 shrink-0" />
                            <span className="truncate">Cita: {linkedAppointment.title}</span>
                          </div>
                        )}
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center justify-between border-t border-[#ECE8E0] pt-2.5 mt-1">
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="text-[9px] font-bold text-[#8C9B73] flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Transcrito OCR</span>
                        </button>

                        {!viewOwnerId && (
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="text-[9px] font-medium text-rose-500 hover:bg-rose-50 p-1 px-1.5 rounded cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewing full OCR text modal dialogue */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-[#2F3E46]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 max-w-lg w-full space-y-4 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-md font-serif font-semibold text-[#2F3E46]">{viewingDoc.name}</h4>
                <span className="text-[9px] font-extrabold uppercase text-[#5A634D] bg-[#F4F1ED] border border-[#ECE8E0] px-2 py-0.5 rounded-xl">
                  {viewingDoc.type}
                </span>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-[#A3A19E] hover:text-[#5A634D] font-bold p-1 hover:bg-[#FBF9F4] rounded-lg cursor-pointer text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="p-4 bg-[#2F3E46] text-[#F4F1ED] rounded-3xl overflow-y-auto max-h-72 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
              {viewingDoc.ocrText || "Ningún texto decodificado todavía."}
            </div>

            {viewingDoc.extractedMetadata && (
              <div className="p-4 bg-[#FBF9F4] border border-[#ECE8E0] rounded-3xl space-y-2 text-xs">
                <p className="font-semibold text-[#5A634D]">Resumen Sanitario de la IA:</p>
                <p className="text-[#7A7875] line-clamp-4 italic">"{viewingDoc.extractedMetadata.keyFindings}"</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#A3A19E] pt-1.5 border-t border-[#ECE8E0]">
                  <p>Médico: {viewingDoc.extractedMetadata.doctorName}</p>
                  <p>Fecha: {viewingDoc.extractedMetadata.dateOfDocument}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
