import { Article, Volume, User, JournalConfig } from './types';

export const JOURNAL_INFO: JournalConfig = {
  name: 'Scientia Dentis "Revista Científica"',
  shortName: "Scientia Dentis",
  issn: "e-ISSN: 2448-8976",
  description: "Scientia Dentis 'Revista Científica' es el Órgano Oficial de difusión científica y académica del Colegio de Odontólogos de La Paz (COLP). Publicación arbitrada por pares doble ciego dedicada a investigaciones estomatológicas originales, avances clínicos y biomateriales.",
  institution: "Colegio de Odontólogos de La Paz (COLP)",
  editorInChief: "Dra. Beatriz Villalobos, PhD"
};

export const INITIAL_VOLUMES: Volume[] = [
  {
    id: "v12n2",
    title: "Vol. 12 Núm. 2 (2026): Revista Internacional de Odontología Avanzada",
    volumeNumber: 12,
    issueNumber: 2,
    year: 2026,
    isCurrent: true,
    publishedAt: "2026-06-15",
    coverImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60" // High-quality dental research / laboratory vibe
  },
  {
    id: "v12n1",
    title: "Vol. 12 Núm. 1 (2025): Avances en Periodoncia e Implantología Clínica",
    volumeNumber: 12,
    issueNumber: 1,
    year: 2025,
    isCurrent: false,
    publishedAt: "2025-12-10",
    coverImage: "https://images.unsplash.com/photo-1579684389782-64d84b5e901d?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "v11n2",
    title: "Vol. 11 Núm. 2 (2024): Nuevos Horizontes en Endodoncia y Odontología Restauradora",
    volumeNumber: 11,
    issueNumber: 2,
    year: 2024,
    isCurrent: false,
    publishedAt: "2024-06-20",
    coverImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=60"
  }
];

export const DENTAL_CATEGORIES = [
  "Implantología Oral",
  "Endodoncia",
  "Periodoncia",
  "Ortodoncia y Ortopedia Maxilar",
  "Odontopediatría",
  "Odontología Restauradora y Estética",
  "Patología y Medicina Oral",
  "Cirugía Maxilofacial"
];

export const AI_USAGE_SECTIONS_LIST = [
  "Aval ético / Consentimiento informado",
  "Página de título / Metadatos",
  "Declaración de conflicto de intereses",
  "Conformidad autoral",
  "Cesión de derechos",
  "Tablas y/o figuras",
  "Redacción / Traducción / Revisión de estilo",
  "Búsqueda bibliográfica / Síntesis de literatura",
  "Análisis de datos / Estadística"
];

export const ACADEMIC_REVIEWERS: User[] = [
  {
    id: "rev1",
    name: "Dr. Alejandro Ruiz, PhD",
    email: "aruiz@universidad.edu",
    role: "reviewer",
    affiliation: "Facultad de Odontología, Universidad de Valparaíso",
    specialty: "Implantología Oral, Periodoncia"
  },
  {
    id: "rev2",
    name: "Dra. Claudia Espinoza, PhD",
    email: "cespinoza@odontocentro.cl",
    role: "reviewer",
    affiliation: "Departamento de Endodoncia, Universidad de Chile",
    specialty: "Endodoncia, Biomateriales"
  },
  {
    id: "rev3",
    name: "Dr. Mauricio Valenzuela, MSc",
    email: "mvalenzuela@ortodental.org",
    role: "reviewer",
    affiliation: "Sociedad Iberoamericana de Ortodoncia",
    specialty: "Ortodoncia y Ortopedia Maxilar, Odontopediatría"
  },
  {
    id: "rev4",
    name: "Dra. Sofía Mendoza, PhD",
    email: "smendoza@biomateriales.edu",
    role: "reviewer",
    affiliation: "Centro de Investigación en Bioingeniería y Tejidos Dentales",
    specialty: "Odontología Restauradora y Estética, Biomateriales"
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "art1",
    title: "Eficacia de los implantes de titanio-zirconio en pacientes diabéticos tipo 2 controlados: Un estudio clínico controlado aleatorizado a 3 años",
    abstract: "INTRODUCCIÓN: El éxito del tratamiento con implantes oseointegrados puede verse comprometido por enfermedades sistémicas como la diabetes. Los nuevos implantes de aleación titanio-zirconio (TiZr) ofrecen mayor resistencia mecánica y mejores propiedades de oseointegración. El objetivo de este estudio fue evaluar las tasas de supervivencia y el éxito clínico de implantes TiZr en pacientes diabéticos tipo 2 bien controlados en comparación con pacientes sanos durante un período de seguimiento de 3 años.\n\nMÉTODOS: Se diseñó un estudio clínico controlado aleatorizado de dos grupos paralelos. Se reclutaron 48 pacientes que requerían implantes unitarios: Grupo de estudio (n=24, diabéticos tipo 2 controlados con HbA1c < 7.0%) y Grupo de control (n=24, pacientes sistémicamente sanos). Se colocaron implantes TiZr de superficie hidrófila. Se midió la pérdida ósea marginal (MBL) mediante radiografías estandarizadas, el índice de placa (PI), el sangrado al sondaje (BOP) y la profundidad de sondaje periimplantario (PPD) a los 12, 24 y 36 meses.\n\nRESULTADOS: Se colocaron un total de 62 implantes. Al cabo de 36 meses, la tasa de supervivencia de los implantes fue del 96.8% en el grupo diabético y del 100% en el grupo control, sin diferencias estadísticamente significativas (p > 0.05). La pérdida ósea marginal promedio a los 3 años fue de 0.42 ± 0.15 mm para el grupo diabético y de 0.38 ± 0.12 mm para el grupo de control (p = 0.23). Los parámetros clínicos de BOP, PI y PPD se mantuvieron en rangos estables de salud periimplantaria en ambos grupos.\n\nCONCLUSIONES: Los implantes de titanio-zirconio con superficie hidrófila demuestran una alta tasa de éxito y supervivencia a los 3 años en pacientes diabéticos tipo 2 controlados, siendo una alternativa terapéutica predecible y equivalente a los pacientes sanos.",
    authors: ["Dr. Carlos Baeza-Ahumada", "Dra. Helena Santander-Gómez", "Dr. Nelson Alvear-Castillo"],
    authorEmails: ["cbaeza@hospitaldental.cl", "hsantander@universidad.cl", "nalvear@clinica.cl"],
    affiliations: ["Hospital Clínico Odontológico, Universidad Metropolitana", "Departamento de Prótesis e Implantología, Facultad de Odontología", "Unidad de Endocrinología, Centro de Investigaciones Médicas"],
    keywords: ["Implantes dentales", "Titanio-Zirconio", "Diabetes mellitus tipo 2", "Oseointegración", "Pérdida ósea marginal"],
    category: "Implantología Oral",
    submittedAt: "2026-01-10",
    status: "published",
    manuscriptFile: {
      name: "Baeza_TiZr_Implantes_Diabetes.pdf",
      size: "2.4 MB",
      format: "pdf"
    },
    figures: [
      {
        id: "f1_1",
        name: "Figura_1_Flujograma_CONSORT.eps",
        type: "figure",
        format: "eps",
        size: "3.8 MB",
        dpi: 600,
        figureNumber: "Figura 1",
        caption: "Diagrama de flujo CONSORT de asignación, intervención y seguimiento a 36 meses de pacientes diabéticos y controles.",
        uploadedAt: "2026-01-10"
      },
      {
        id: "f1_2",
        name: "Figura_2_Radiografias_MarginalBoneLoss.tiff",
        type: "figure",
        format: "tiff",
        size: "14.2 MB",
        dpi: 300,
        figureNumber: "Figura 2",
        caption: "Serie radiográfica periapical estandarizada con posicionador Rinn al inicio (T0), 12m (T1), 24m (T2) y 36m (T3).",
        uploadedAt: "2026-01-10"
      },
      {
        id: "f1_3",
        name: "Figura_3_Micrografia_SEM_TiZr.tiff",
        type: "figure",
        format: "tiff",
        size: "22.5 MB",
        dpi: 600,
        figureNumber: "Figura 3",
        caption: "Microfotografía electrónica de barrido (SEM) de la topografía hidrófila de la aleación TiZr a 5000x.",
        uploadedAt: "2026-01-10"
      }
    ],
    supplementaryFiles: [
      {
        id: "s1_1",
        name: "Aval_Comite_Etica_Ref_CEI_2025_44.pdf",
        type: "ethics",
        format: "pdf",
        size: "850 KB",
        caption: "Certificado aprobatorio del Comité Ético Científico del Hospital Universitario.",
        uploadedAt: "2026-01-10"
      },
      {
        id: "s1_2",
        name: "Baeza_Manuscrito_Editable_Control_Cambios.docx",
        type: "manuscript",
        format: "docx",
        size: "1.2 MB",
        caption: "Versión editable en Word (.docx) con autoría y tablas maestras para maquetación técnica.",
        uploadedAt: "2026-01-10"
      }
    ],
    reviewers: ["rev1", "rev4"],
    reviews: [
      {
        id: "r1_1",
        articleId: "art1",
        reviewerId: "rev1",
        reviewerName: "Dr. Alejandro Ruiz, PhD",
        originalityScore: 5,
        methodologyScore: 4,
        clinicalRelevanceScore: 5,
        ethicalScore: 5,
        comments: "Un estudio sumamente riguroso y con relevancia clínica excepcional. La selección de implantes TiZr de superficie hidrófila es clave para este tipo de pacientes. Recomiendo aceptar el manuscrito en su forma actual, ya que el diseño del ensayo controlado aleatorizado cumple con todas las directrices CONSORT.",
        recommendation: "accept",
        submittedAt: "2026-02-15"
      },
      {
        id: "r1_2",
        articleId: "art1",
        reviewerId: "rev4",
        reviewerName: "Dra. Sofía Mendoza, PhD",
        originalityScore: 4,
        methodologyScore: 4,
        clinicalRelevanceScore: 5,
        ethicalScore: 5,
        comments: "El artículo aporta evidencia de alta calidad sobre la idoneidad clínica de la aleación TiZr en ambientes sistémicamente condicionados. Sugiero únicamente clarificar en la sección de discusión si el protocolo de carga fue convencional o temprano.",
        recommendation: "minor_revisions",
        submittedAt: "2026-02-22"
      }
    ],
    editorNotes: "Artículo de alta relevancia clínica y metodológica. Se aprueba la publicación en el Vol. 12 Núm. 2 tras resolver adecuadamente las observaciones menores del revisor 2.",
    publishedInVolumeId: "v12n2",
    doi: "https://doi.org/10.48512/rcoab.2026.12201",
    references: [
      "Buser D, Sennerby L, De Bruyn H. Modern implant dentistry based on osseointegration. Periodontol 2000. 2017;73(1):7-21.",
      "Naujokat H, Kunzendorf B, Wiltfang J. Dental implants and systemic diseases: a systematic review. Int J Implant Dent. 2020;6(1):17.",
      "Grandjean M, et al. Titanium-zirconium versus titanium implants: mechanical properties and osseointegration. J Biomater Appl. 2021;35(8):1011-1025."
    ],
    aiDeclaration: {
      used: true,
      sectionsUsed: [
        "Tablas y/o figuras",
        "Redacción / Traducción / Revisión de estilo",
        "Página de título"
      ],
      toolsAndScope: "Se utilizó Claude 3.5 Sonnet para la revisión de redacción del abstract en inglés y el formateo de la matriz de datos de la Tabla 2. Los autores revisaron y validaron íntegramente los datos y asumen total responsabilidad.",
      humanSupervisionConfirmed: true
    },
    wordCount: 3840,
    hasStructuredAbstract: true,
    formattingScore: 95,
    formattingReport: [
      "Estructura IMRAD correcta.",
      "Resumen estructurado completo.",
      "Formato de referencias Vancouver verificado.",
      "Conflicto de intereses declarado correctamente."
    ]
  },
  {
    id: "art2",
    title: "Análisis tridimensional del sellado apical en conductos radiculares obturados con cementos biocerámicos frente a gutapercha termoplastificada mediante micro-tomografía computarizada (Micro-CT)",
    abstract: "INTRODUCCIÓN: El objetivo principal del tratamiento endodóntico es lograr un sellado tridimensional hermético del conducto radicular para prevenir la recontaminación bacteriana. Los cementos biocerámicos han ganado popularidad por su biocompatibilidad y propiedades bioactivas. Este estudio comparó in vitro la calidad del sellado apical y la presencia de vacíos (voids) utilizando cementos biocerámicos frente a la técnica convencional de gutapercha termoplastificada, analizados mediante micro-tomografía computarizada de alta resolución (Micro-CT).\n\nMÉTODOS: Se seleccionaron 30 premolares inferiores unirradiculares humanos extraídos por motivos ortodónticos. Todos los conductos se instrumentaron con el sistema rotatorio WaveOne Gold hasta la lima Large (45/.05) e irrigación estándar con NaOCl al 5.25% y EDTA al 17%. Las muestras fueron divididas aleatoriamente en dos grupos de obturación (n=15): Grupo BC (Cementación con biocerámico iRoot SP mediante cono único) y Grupo TG (Gutapercha termoplastificada con cemento base resina AH Plus mediante condensación de ola continua). Las muestras se escanearon en un micro-tomógrafo a una resolución de 9 µm. Se calculó volumétricamente el porcentaje total de vacíos en los 3 mm apicales.\n\nRESULTADOS: El análisis por Micro-CT reveló presencia de vacíos en todas las muestras de ambos grupos. Sin embargo, el Grupo BC (Biocerámico) mostró un porcentaje significativamente menor de volumen total de vacíos en el tercio apical (1.42% ± 0.51%) en comparación con el Grupo TG (Gutapercha termoplastificada) (3.84% ± 1.15%), con diferencias estadísticamente significativas (p < 0.001). No se observaron diferencias significativas en la homogeneidad de la masa del cemento, pero sí en la adaptación a las irregularidades del conducto, que favoreció al biocerámico.\n\nCONCLUSIONES: La técnica de obturación con cono único asistida por cemento biocerámico proporcionó un mejor sellado tridimensional en los 3 milímetros apicales que la técnica de gutapercha termoplastificada en conductos ovales de premolares, reduciendo notablemente la cantidad de vacíos internos y marginales.",
    authors: ["Dra. Camila Fuentes-Larraín", "Dr. Roberto Maturana-Sanz"],
    authorEmails: ["cfuentes@endoclinic.cl", "rmaturana@facultad.edu"],
    affiliations: ["Postgrado de Endodoncia, Universidad Dental del Sur", "Departamento de Odontología Conservadora, Universidad de Valparaíso"],
    keywords: ["Endodoncia", "Obturación de conductos", "Cementos biocerámicos", "Micro-tomografía computarizada", "Sellado apical"],
    category: "Endodoncia",
    submittedAt: "2026-02-18",
    status: "published",
    manuscriptFile: {
      name: "Fuentes_MicroCT_Biocermicos_Endodoncia.docx",
      size: "3.1 MB",
      format: "docx"
    },
    figures: [
      {
        id: "f2_1",
        name: "Figura_1_Reconstruccion_MicroCT_3D.tiff",
        type: "figure",
        format: "tiff",
        size: "18.6 MB",
        dpi: 300,
        figureNumber: "Figura 1",
        caption: "Reconstrucción 3D por Micro-CT de los 3 mm apicales mostrando distribución de vacíos (en rojo) y masa obturadora.",
        uploadedAt: "2026-02-18"
      },
      {
        id: "f2_2",
        name: "Figura_2_Cortes_Transversales_Apical.jpg",
        type: "figure",
        format: "jpg",
        size: "4.5 MB",
        dpi: 300,
        figureNumber: "Figura 2",
        caption: "Cortes axiales comparativos de microtomografía a 1 mm, 2 mm y 3 mm del ápice anatómico.",
        uploadedAt: "2026-02-18"
      }
    ],
    supplementaryFiles: [
      {
        id: "s2_1",
        name: "Matriz_Datos_Volumetricos_MicroCT.xlsx",
        type: "supplementary",
        format: "xlsx",
        size: "420 KB",
        caption: "Datos crudos de volumen total y porcentaje de vacíos por corte microtomográfico.",
        uploadedAt: "2026-02-18"
      }
    ],
    reviewers: ["rev2"],
    reviews: [
      {
        id: "r2_1",
        articleId: "art2",
        reviewerId: "rev2",
        reviewerName: "Dra. Claudia Espinoza, PhD",
        originalityScore: 4,
        methodologyScore: 5,
        clinicalRelevanceScore: 4,
        ethicalScore: 5,
        comments: "Un uso impecable de la metodología de Micro-CT, que hoy en día representa el estándar de oro para este tipo de estudios in vitro. El artículo está bien redactado y las conclusiones son mesuradas. Recomiendo su publicación.",
        recommendation: "accept",
        submittedAt: "2026-03-20"
      }
    ],
    editorNotes: "Estudio in vitro de alta precisión técnica. Publicado en la sección de Endodoncia del volumen actual.",
    publishedInVolumeId: "v12n2",
    doi: "https://doi.org/10.48512/rcoab.2026.12202",
    references: [
      "Prati C, Gandolfi MG. Calcium silicate bioactive cements as epitomes of a new era of endodontic materials. Biocompat Dent. 2015;41(4):11-23.",
      "Guven Y, et al. Micro-CT evaluation of apical sealing ability of bioceramic sealers. J Endod. 2019;45(3):311-316."
    ],
    aiDeclaration: {
      used: false,
      sectionsUsed: [],
      humanSupervisionConfirmed: true
    },
    wordCount: 3120,
    hasStructuredAbstract: true,
    formattingScore: 98,
    formattingReport: [
      "Estructura científica estricta.",
      "Imágenes de microtomografía de alta resolución referenciadas.",
      "Referencias completas y formateadas."
    ]
  },
  {
    id: "art3",
    title: "Evaluación clínica de la hipersensibilidad dentinaria post-tratamiento blanqueador en consulta con peróxido de hidrógeno al 35% adicionado con nitrato de potasio y fluoruro de sodio",
    abstract: "INTRODUCCIÓN: El blanqueamiento dental en consulta es un procedimiento estético de alta demanda, pero su principal efecto adverso es la hipersensibilidad dentinaria transitoria. El objetivo de este ensayo clínico a doble ciego fue evaluar la intensidad de la hipersensibilidad dentinaria post-blanqueamiento utilizando una fórmula comercial de peróxido de hidrógeno al 35% que incorpora agentes desensibilizantes (nitrato de potasio al 2% y fluoruro de sodio al 0.9%) en comparación con una fórmula convencional sin aditivos.\n\nMÉTODOS: Se seleccionaron 40 pacientes sanos que cumplían con los criterios de inclusión. En un diseño de boca dividida (split-mouth), se aplicó de forma aleatoria el gel blanqueador de prueba (HP+Desensibilizante) en una hemiarcada y el gel blanqueador control (HP puro) en la hemiarcada contralateral durante 3 sesiones de 15 minutos en una sola cita. La sensibilidad se registró inmediatamente después del procedimiento, a las 24 horas y a las 48 horas utilizando la Escala Visual Análoga (VAS, 0-10) estimulada mediante chorro de aire frío y sonda táctil.\n\nRESULTADOS: El blanqueamiento de hemiarcadas arrojó una efectividad estética similar en cambios de color (p = 0.81). En cuanto a la sensibilidad dentinaria, el grupo de prueba (HP+Desensibilizante) reportó puntuaciones VAS significativamente menores inmediatamente después de la sesión (2.1 ± 1.1) en comparación con el grupo control (4.6 ± 1.8) (p < 0.01). Esta diferencia estadísticamente significativa se mantuvo a las 24 horas (1.2 ± 0.8 vs 3.1 ± 1.4, p < 0.05). A las 48 horas, los niveles de sensibilidad de ambos grupos disminuyeron a cifras basales sin diferencias.\n\nCONCLUSIONES: El peróxido de hidrógeno al 35% con nitrato de potasio y fluoruro de sodio incorporados reduce significativamente la intensidad y duración de la hipersensibilidad dentinaria post-blanqueamiento de manera inmediata y a las 24 horas, sin afectar la eficacia estética del tratamiento blanqueador en consulta.",
    authors: ["Dr. Gonzalo Martínez-Rojas", "Dra. Patricia Toledo-Vargas", "Dr. Andrés Silva-Ugarte"],
    authorEmails: ["gmartinez@clinicadental.cl", "ptoledo@salud.cl", "asilva@universidad.cl"],
    affiliations: ["Servicio de Odontología, Hospital Clínico Regional", "Área de Odontología Restauradora, Universidad del Norte", "Departamento de Fisiología Oral, Facultad de Odontología"],
    keywords: ["Blanqueamiento dental", "Peróxido de hidrógeno", "Hipersensibilidad dentinaria", "Nitrato de potasio", "Estética dental"],
    category: "Odontología Restauradora y Estética",
    submittedAt: "2026-05-12",
    status: "under_review",
    manuscriptFile: {
      name: "Martinez_EstudioClinico_Blanqueamiento_Hipersensibilidad.docx",
      size: "1.8 MB",
      format: "docx"
    },
    figures: [
      {
        id: "f3_1",
        name: "Figura_1_Curvas_Sensibilidad_VAS_48h.eps",
        type: "figure",
        format: "eps",
        size: "2.9 MB",
        dpi: 600,
        figureNumber: "Figura 1",
        caption: "Curva comparativa de sensibilidad en escala VAS (0-10) en hemiarcadas test vs control a 0h, 24h y 48h.",
        uploadedAt: "2026-05-12"
      },
      {
        id: "f3_2",
        name: "Figura_2_Registro_Fotografico_Espectrofotometria.jpg",
        type: "figure",
        format: "jpg",
        size: "8.1 MB",
        dpi: 300,
        figureNumber: "Figura 2",
        caption: "Fotografía clínica estandarizada de cambios de tono con guía Vita Classical y espectrofotómetro digital.",
        uploadedAt: "2026-05-12"
      }
    ],
    supplementaryFiles: [
      {
        id: "s3_1",
        name: "Consentimiento_Informado_Pacientes_Firmado.pdf",
        type: "ethics",
        format: "pdf",
        size: "1.1 MB",
        caption: "Formulario modelo de consentimiento informado firmado y aprobado por comité ético.",
        uploadedAt: "2026-05-12"
      }
    ],
    reviewers: ["rev4", "rev2"],
    reviews: [
      {
        id: "r3_1",
        articleId: "art3",
        reviewerId: "rev4",
        reviewerName: "Dra. Sofía Mendoza, PhD",
        originalityScore: 3,
        methodologyScore: 4,
        clinicalRelevanceScore: 5,
        ethicalScore: 5,
        comments: "Un ensayo clínico bien diseñado que aborda un problema del día a día en clínica odontológica. El uso del diseño de boca dividida es muy acertado para controlar variables del huésped. Sin embargo, en los resultados convendría detallar si existió algún caso de irritación gingival transitoria, considerando la alta concentración del peróxido.",
        recommendation: "minor_revisions",
        submittedAt: "2026-06-18"
      }
    ],
    references: [
      "Haywood VB, Heymann HO. Nightguard vital bleaching. Quintessence Int. 1989;20(3):173-176.",
      "Joiner A. The bleaching of teeth: a review of the literature. J Dent. 2006;34(7):412-419."
    ],
    aiDeclaration: {
      used: true,
      sectionsUsed: [
        "Aval ético / Consentimiento informado",
        "Declaración de conflicto de intereses",
        "Tablas y/o figuras"
      ],
      toolsAndScope: "Se utilizó ChatGPT-4o para la estandarización del texto del consentimiento informado y la generación de gráficos vectoriales para la curva de sensibilidad VAS en las Figuras 1 y 2. Todo fue contrastado con los registros clínicos originales.",
      humanSupervisionConfirmed: true
    },
    wordCount: 2950,
    hasStructuredAbstract: true,
    formattingScore: 88,
    formattingReport: [
      "Resumen con divisiones IMRAD claras.",
      "Registro de consentimiento informado de pacientes presente.",
      "Uso correcto de la escala visual análoga (VAS)."
    ]
  },
  {
    id: "art4",
    title: "Efecto antimicrobiano de nanopartículas de óxido de zinc sintetizadas mediante extracto de propóleo frente a Streptococcus mutans en biopelículas dentales",
    abstract: "INTRODUCCIÓN: Streptococcus mutans es el principal agente etiológico de la caries dental debido a su capacidad acidogénica y de síntesis de biopelículas extracelulares. El auge de la nanotecnología y la síntesis verde ofrece nuevas alternativas antimicrobianas. Este estudio in vitro evaluó la actividad antibacteriana y antibiopelícula de nanopartículas de óxido de zinc (ZnO-NPs) obtenidas mediante síntesis ecológica utilizando extracto de propóleo chileno contra cepas de S. mutans.\n\nMÉTODOS: Se sintetizaron ZnO-NPs y se caracterizaron ópticamente. Se determinó la Concentración Mínima Inhibitoria (CMI) y Concentración Mínima Bactericida (CMB) de las nanopartículas mediante dilución en microplaca frente a S. mutans (ATCC 25175). El efecto sobre la formación y viabilidad de biopelículas maduras de 24 horas se evaluó mediante tinción con cristal violeta y el ensayo de reducción colorimétrica de MTT. El vehículo neutro y la clorhexidina al 0.12% sirvieron como controles negativo y positivo respectivamente.\n\nRESULTADOS: Las ZnO-NPs mostraron una morfología esférica con un tamaño promedio de 28 nm. La CMI obtenida para S. mutans fue de 62.5 µg/mL y la CMB fue de 125 µg/mL. En cuanto al efecto sobre la biopelícula, concentraciones sub-inhibitorias de ZnO-NPs (31.25 µg/mL) inhibieron significativamente la adherencia inicial bacteriana en un 72% en comparación al control negativo (p < 0.05). Para biopelículas maduras de 24 horas, la aplicación de ZnO-NPs a 250 µg/mL redujo la viabilidad metabólica de la biopelícula en un 84%, superando estadísticamente el efecto de la clorhexidina al 0.12% para ese modelo temporal (p < 0.01).\n\nCONCLUSIONES: Las nanopartículas de óxido de zinc sintetizadas ecológicamente con extracto de propóleo exhiben un potente potencial antimicrobiano y antibiopelícula in vitro contra Streptococcus mutans. Esto sugiere su futura incorporación viable en agentes terapéuticos de higiene bucal, tales como colutorios o dentífricos, para el control preventivo de la caries dental.",
    authors: ["Dra. Andrea Morales-Pinochet", "Dr. Francisco Valdivia-Novoa"],
    authorEmails: ["amorales@microbiologia.cl", "fvaldivia@sociedad.cl"],
    affiliations: ["Laboratorio de Bioquímica y Microbiología Oral, Centro de Investigación en Ciencias Estomatológicas", "Sección de Odontología Preventiva, Facultad de Odontología"],
    keywords: ["Streptococcus mutans", "Nanopartículas de óxido de zinc", "Síntesis verde", "Propóleo", "Caries dental"],
    category: "Patología y Medicina Oral",
    submittedAt: "2026-07-02",
    status: "submitted",
    manuscriptFile: {
      name: "Morales_NanoZinc_Streptococcus_Mutans.docx",
      size: "4.2 MB",
      format: "docx"
    },
    figures: [
      {
        id: "f4_1",
        name: "Figura_1_TEM_Nanoparticulas_ZnO.tiff",
        type: "figure",
        format: "tiff",
        size: "16.4 MB",
        dpi: 600,
        figureNumber: "Figura 1",
        caption: "Microscopía electrónica de transmisión (TEM) revelando morfología y distribución nanométrica (28 ± 4 nm).",
        uploadedAt: "2026-07-02"
      },
      {
        id: "f4_2",
        name: "Figura_2_Grafico_Inhibicion_Biopelicula_MTT.eps",
        type: "figure",
        format: "eps",
        size: "3.2 MB",
        dpi: 600,
        figureNumber: "Figura 2",
        caption: "Porcentaje de viabilidad metabólica de biopelículas de S. mutans frente a distintas concentraciones de ZnO-NPs.",
        uploadedAt: "2026-07-02"
      }
    ],
    supplementaryFiles: [
      {
        id: "s4_1",
        name: "Carta_Originalidad_Declaracion_Autores.pdf",
        type: "supplementary",
        format: "pdf",
        size: "520 KB",
        caption: "Carta de presentación formal firmada por todos los autores declarando originalidad e inédito.",
        uploadedAt: "2026-07-02"
      }
    ],
    reviewers: [],
    reviews: [],
    references: [
      "Hernández-Sierra JF, et al. Bactericidal effect of silver, zinc oxide and gold nanoparticles on Streptococcus mutans. Biofouling. 2008;24(6):437-441.",
      "Yamamoto O. Influence of particle size on the antibacterial activity of zinc oxide. Int J Inorg Mater. 2001;3(7):643-646."
    ],
    wordCount: 4100,
    hasStructuredAbstract: true,
    formattingScore: 92,
    formattingReport: [
      "Estructura metodológica completa.",
      "Análisis estadístico (MTT y ANOVA) bien detallado.",
      "Palabras clave coincidentes con terminología MeSH."
    ]
  }
];
