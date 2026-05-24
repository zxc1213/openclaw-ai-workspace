import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, TableBorders, ShadingType, convertInchesToTwip,
  ImageRun, PageBreak
} from "docx";
import fs from "fs";

// ==================== Helpers ====================
const FONT = "仿宋";
const FONT_TITLE = "黑体";
const FONT_HEADING = "黑体";

function title(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({ text, bold: true, size: 44, font: FONT_TITLE }),
    ],
  });
}

function subtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 300 },
    children: [
      new TextRun({ text, size: 28, font: FONT, color: "666666" }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [
      new TextRun({ text, bold: true, size: 32, font: FONT_HEADING }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({ text, bold: true, size: 28, font: FONT_HEADING }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, size: 24, font: FONT_HEADING }),
    ],
  });
}

function bodyText(text, { indent = true, bold = false } = {}) {
  return new Paragraph({
    spacing: { line: 400, after: 60 },
    indent: indent ? { firstLine: convertInchesToTwip(0.59) } : undefined,
    children: [
      new TextRun({ text, size: 24, font: FONT, bold }),
    ],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { line: 400, after: 40 },
    indent: { left: convertInchesToTwip(0.4 + level * 0.3), hanging: convertInchesToTwip(0.2) },
    children: [
      new TextRun({ text: "• ", size: 24, font: FONT }),
      new TextRun({ text, size: 24, font: FONT }),
    ],
  });
}

function numberedItem(num, text, level = 0) {
  return new Paragraph({
    spacing: { line: 400, after: 40 },
    indent: { left: convertInchesToTwip(0.4 + level * 0.3), hanging: convertInchesToTwip(0.2) },
    children: [
      new TextRun({ text: `${num}. `, size: 24, font: FONT, bold: true }),
      new TextRun({ text, size: 24, font: FONT }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 100 }, children: [] });
}

// Table helper
function createTable(headers, rows) {
  const headerCells = headers.map(h => new TableCell({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: h, bold: true, size: 22, font: FONT })],
    })],
    shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
    verticalAlign: "center",
  }));

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: cell, size: 22, font: FONT })],
      })],
      verticalAlign: "center",
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headerCells, tableHeader: true }),
      ...dataRows,
    ],
  });
}

function labelValue(label, value) {
  return new Paragraph({
    spacing: { line: 400, after: 60 },
    indent: { firstLine: convertInchesToTwip(0.59) },
    children: [
      new TextRun({ text: label, size: 24, font: FONT, bold: true }),
      new TextRun({ text: value, size: 24, font: FONT }),
    ],
  });
}

// ==================== Document Content ====================

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { size: 24, font: FONT },
        paragraph: { spacing: { line: 360 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1.18),
          bottom: convertInchesToTwip(1.18),
          left: convertInchesToTwip(1.18),
          right: convertInchesToTwip(1.18),
        },
      },
    },
    children: [
      // ===== 封面 =====
      emptyLine(), emptyLine(), emptyLine(),
      title("交通科技协同创新信息系统"),
      title("互联网发布方案"),
      emptyLine(),
      subtitle("（含系统间数据流向与网络拓扑说明）"),
      emptyLine(), emptyLine(), emptyLine(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "广东省交通集团有限公司", size: 28, font: FONT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [new TextRun({ text: "2026年3月", size: 24, font: FONT, color: "666666" })],
      }),

      // ===== 分页 =====
      new Paragraph({ children: [new PageBreak()] }),

      // ===== 目录页提示 =====
      title("目  录"),
      emptyLine(),
      bodyText("一、系统概述与互联网发布必要性", { indent: false, bold: true }),
      bodyText("二、系统组成与功能定位", { indent: false }),
      bodyText("三、用户分类与系统访问关系", { indent: false }),
      bodyText("四、系统间数据流向", { indent: false }),
      bodyText("五、应用网络拓扑", { indent: false }),
      bodyText("六、网络安全与访问控制策略", { indent: false }),

      new Paragraph({ children: [new PageBreak()] }),

      // ===== 第一章 =====
      heading1("一、系统概述与互联网发布必要性"),

      heading2("1.1 系统概述"),
      bodyText("广东省交通科技协同创新信息系统是由广东省交通集团统筹建设的综合性科技管理信息化平台体系，旨在通过信息化手段整合集团及下属单位的科技资源，实现科研项目管理、科技成果转化、科技资源共享、协同创新管理等核心业务的信息化支撑。"),
      bodyText("本系统体系涵盖四个核心平台，覆盖省级行业门户、集团级管理中枢及子公司级业务节点，形成自上而下的三级科技管理信息化架构。"),

      heading2("1.2 互联网发布的必要性"),
      bodyText("根据广东省交通运输行业信息化建设要求及集团数字化转型战略，将相关系统面向互联网发布具有以下必要性："),

      numberedItem(1, "满足行业监管与社会服务要求"),
      bodyText("广东省交通科技协同创新信息平台作为省级交通科技行业门户，需面向社会公众和行业单位提供科技政策发布、科研资讯查询、科技项目公示等公共服务，互联网发布是实现上述服务的前提条件。"),

      numberedItem(2, "提升科研协同效率"),
      bodyText("集团下属企业分布广泛，部分单位办公地点分散，互联网接入可打破地理限制，使各级科研人员能够随时随地通过安全通道访问科技管理平台，开展项目申报、成果管理、协同办公等业务，显著提升科研协同效率。"),

      numberedItem(3, "促进科技成果转化与资源共享"),
      bodyText("互联网发布可实现科技成果、技术标准、科研数据的跨单位共享，促进产学研合作和技术成果向生产力转化，为交通行业科技创新提供信息化基础保障。"),

      numberedItem(4, "符合政策合规要求"),
      bodyText("根据《网络安全法》《数据安全法》及等保2.0等相关法律法规要求，信息系统互联网发布需满足等级保护、数据安全、访问控制等合规要求。本方案同时覆盖了互联网发布的技术架构与安全策略设计，确保系统在互联网发布后的安全合规运行。"),

      // ===== 第二章 =====
      heading1("二、系统组成与功能定位"),
      bodyText("本系统体系由以下四个核心平台组成："),

      createTable(
        ["序号", "系统名称", "层级", "主要功能定位"],
        [
          ["1", "广东省交通科技协同创新信息平台", "省级门户层", "面向互联网的公众服务门户，提供科技政策发布、科研资讯、项目申报、成果公示等服务"],
          ["2", "集团科技协同管理平台", "集团管理层", "集团级科技管理中枢，实现科研项目管理、数据汇总、业务协同与标准化处理"],
          ["3", "华路科技管理平台", "子公司业务层", "华路科技子公司内部的科研业务管理系统，实现数据上报与业务办理"],
          ["4", "建设公司科技管理平台", "子公司业务层", "建设公司子公司内部的科研业务管理系统，实现数据上报与业务办理"],
        ]
      ),
      emptyLine(),
      bodyText("四个平台形成「省—集团—子公司」三级联动架构，其中集团科技协同管理平台作为中间枢纽，承担数据中转、标准化处理和业务协调的核心职能。"),

      // ===== 第三章 =====
      heading1("三、用户分类与系统访问关系"),

      heading2("3.1 用户分类"),
      bodyText("本系统体系的用户按组织归属和访问权限划分为以下三类："),

      heading3("3.1.1 公众用户"),
      bodyText("包括社会公众、科研机构、高校、行业单位等外部用户。通过互联网直接访问广东省交通科技协同创新信息平台，获取交通科技资讯、查询政策法规、办理协同业务、咨询科研问题等。"),

      heading3("3.1.2 集团内部用户"),
      bodyText("包括集团总部及下属各企业、合作单位的科研管理人员和技术人员。通过集团专网访问集团科技协同管理平台，再由该平台对接广东省交通科技协同创新信息平台，实现科研数据管理、科技业务办理、成果上报等功能。"),

      heading3("3.1.3 子公司用户"),
      bodyText("包括华路科技、建设公司等子公司的科研管理人员和技术人员。此类用户具有两种访问路径："),
      bullet("路径一（专网）：通过内部系统（华路科技管理平台/建设公司科技管理平台）对接集团科技协同管理平台，实现数据上报与业务交互。"),
      bullet("路径二（互联网）：通过互联网直接访问广东省交通科技协同创新信息平台，获取公开服务和参与科研协同活动。"),

      heading2("3.2 用户与系统访问关系汇总"),

      createTable(
        ["用户类型", "可访问系统", "访问网络", "访问方式"],
        [
          ["公众用户", "广东省交通科技协同创新信息平台", "互联网", "直接访问"],
          ["集团内部用户", "集团科技协同管理平台\n广东省交通科技协同创新信息平台", "集团专网\n专网+平台对接", "专网直连\n通过集团平台对接"],
          ["子公司用户", "华路科技/建设公司科技管理平台\n集团科技协同管理平台\n广东省交通科技协同创新信息平台", "内部网络\n集团专网\n互联网", "内部系统直连\n通过内部系统对接\n直接访问"],
        ]
      ),

      // ===== 第四章 =====
      heading1("四、系统间数据流向"),

      heading2("4.1 下行数据流向（自上而下）"),
      bodyText("下行数据流向指信息从省级平台逐级传递至子公司系统的过程："),

      heading3("4.1.1 政策资讯下行"),
      bodyText("广东省交通科技协同创新信息平台 → 集团科技协同管理平台 → 华路科技/建设公司科技管理平台"),
      bodyText("省级平台发布行业政策、科技资讯、科研任务、技术标准等信息，经集团管理平台中转与标准化处理后，推送至各子公司管理平台，确保各级单位及时获取行业动态和工作要求。"),

      heading3("4.1.2 集团数据上报至省级平台"),
      bodyText("集团科技协同管理平台 → 广东省交通科技协同创新信息平台"),
      bodyText("集团管理平台将集团内部的科研成果、业务数据、统计报表等信息上报至省级平台，经审核后面向公众展示，实现集团科技实力的对外展示和行业共享。"),

      heading2("4.2 上行数据流向（自下而上）"),
      bodyText("上行数据流向指数据从子公司逐级汇总至省级平台的过程："),

      heading3("4.2.1 子公司数据上报"),
      bodyText("华路科技/建设公司科技管理平台 → 集团科技协同管理平台"),
      bodyText("子公司管理平台将本单位的科研数据、项目进度、业务办理情况等上报至集团管理平台，由集团平台进行数据汇总、质量校验和标准化处理。"),

      heading3("4.2.2 集团汇总上报"),
      bodyText("集团科技协同管理平台 → 广东省交通科技协同创新信息平台"),
      bodyText("集团管理平台汇总集团本部及各子公司的科研数据，经整理、审核后统一提交至省级平台，实现省级层面对集团科技工作的全面掌握。"),

      heading2("4.3 跨系统直接协同"),
      bodyText("除逐级传递外，部分业务场景支持跨层级直接数据交互："),
      bullet("广东省交通科技协同创新信息平台 ⇄ 华路科技/建设公司科技管理平台"),
      bodyText("科研项目申报、成果评审、技术需求对接等业务场景下，省级平台可与子公司平台直接进行数据交互，提升业务办理效率。集团科技协同管理平台在此过程中作为中间枢纽，负责数据中转、格式标准化和安全审计。"),

      heading2("4.4 数据流向总览"),

      createTable(
        ["数据流向", "数据内容", "流向路径", "说明"],
        [
          ["下行", "行业政策、科技资讯、科研任务", "省级平台 → 集团平台 → 子公司平台", "逐级传递，确保信息触达"],
          ["上行", "科研数据、项目进度、业务数据", "子公司平台 → 集团平台 → 省级平台", "逐级汇总，统一管理"],
          ["横向上报", "集团科研成果、统计数据", "集团平台 → 省级平台", "面向公众展示"],
          ["跨系统协同", "项目申报、成果评审", "省级平台 ⇄ 子公司平台", "经集团平台中转"],
        ]
      ),

      // ===== 第五章 =====
      heading1("五、应用网络拓扑"),

      heading2("5.1 网络分层架构"),
      bodyText("本系统体系的网络拓扑按以下三层架构部署："),

      heading3("5.1.1 互联网接入层"),
      bodyText("部署广东省交通科技协同创新信息平台，面向公众用户提供Web访问服务。该层通过防火墙、WAF、负载均衡等安全设备接入互联网，并配置SSL/TLS加密传输保障数据安全。"),

      heading3("5.1.2 集团专网层"),
      bodyText("部署集团科技协同管理平台，通过集团专网与各子公司内部网络互联。该层同时通过安全网关与互联网接入层对接，实现内外网数据的安全交换。"),

      heading3("5.1.3 子公司内部网络层"),
      bodyText("部署华路科技管理平台、建设公司科技管理平台等子公司级业务系统，通过专线或VPN接入集团专网。各子公司内部网络之间逻辑隔离，仅通过集团管理平台进行数据交互。"),

      heading2("5.2 拓扑层级说明"),
      bodyText("系统拓扑按以下层级布局："),

      createTable(
        ["层级", "系统", "网络环境", "访问对象"],
        [
          ["顶层（公众服务层）", "广东省交通科技协同创新信息平台", "互联网（DMZ区）", "公众用户、行业单位"],
          ["中间层（集团管理层）", "集团科技协同管理平台", "集团专网", "集团内部用户"],
          ["底层（子公司业务层）", "华路科技管理平台、建设公司科技管理平台", "子公司内部网络", "子公司用户"],
        ]
      ),
      emptyLine(),
      bodyText("各层级之间通过防火墙和网关设备进行网络隔离与安全管控，数据在不同网络区域间传输时均经过加密和安全审计处理。"),

      heading2("5.3 拓扑图"),
      bodyText("（拓扑图及数据流图见附件，建议使用 WPS/Visio 打开编辑）"),

      // ===== 第六章 =====
      heading1("六、网络安全与访问控制策略"),

      heading2("6.1 网络安全架构"),
      bodyText("互联网发布涉及公网暴露面，需构建纵深防御的安全架构："),
      bullet("互联网接入层部署防火墙、WAF（Web应用防火墙）、入侵检测/防御系统（IDS/IPS）"),
      bullet("集团专网层部署网络隔离设备，实现内外网逻辑隔离"),
      bullet("子公司内部网络层通过专线/VPN接入集团专网，保障传输通道安全"),

      heading2("6.2 访问控制策略"),
      bullet("公众用户：通过互联网访问省级平台，实施基于角色的访问控制（RBAC），仅能访问公开信息和已授权业务功能"),
      bullet("集团内部用户：通过专网认证接入集团管理平台，采用统一身份认证，按岗位职责分配数据访问权限"),
      bullet("子公司用户：内部系统采用本地认证，对接集团平台时通过API网关进行身份验证和权限校验"),

      heading2("6.3 数据安全"),
      bullet("互联网传输数据均采用HTTPS/TLS加密"),
      bullet("跨网络区域数据交换通过安全数据交换平台进行内容安全检查"),
      bullet("敏感数据存储加密，关键操作留存审计日志"),
      bullet("符合等保2.0三级要求（视系统定级确定）"),

      emptyLine(), emptyLine(),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "— 全文完 —", size: 24, font: FONT, color: "888888" })],
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
const outPath = "/home/rays/.openclaw/workspace/交通科技协同创新信息系统互联网发布方案.docx";
fs.writeFileSync(outPath, buffer);
console.log("✅ 文档已生成: " + outPath);
