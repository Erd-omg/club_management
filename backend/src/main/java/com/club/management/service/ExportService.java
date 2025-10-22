package com.club.management.service;

import com.club.management.common.Result;
import com.club.management.mapper.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

// iText PDF imports
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;

/**
 * 导出服务
 */
@Service
public class ExportService {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private DeptMapper deptMapper;

    @Autowired
    private ActivityMapper activityMapper;

    @Autowired
    private ActivityMemberMapper activityMemberMapper;

    @Autowired
    private SysMessageMapper sysMessageMapper;

    /**
     * 生成导出包
     */
    public Result<Map<String, Object>> generateExport(Map<String, Object> params) {
        try {
            List<String> types = (List<String>) params.get("types");
            String format = (String) params.get("format");
            Boolean includeFiles = (Boolean) params.get("includeFiles");
            String startDate = (String) params.get("startDate");
            String endDate = (String) params.get("endDate");

            // 生成唯一ID
            String exportId = "export_" + System.currentTimeMillis();
            
            // 根据格式生成文件
            String fileName;
            if ("excel".equals(format)) {
                fileName = generateExcelExport(exportId, types, startDate, endDate);
            } else if ("pdf".equals(format)) {
                fileName = generatePdfExport(exportId, types, startDate, endDate);
            } else {
                fileName = generateZipExport(exportId, types, startDate, endDate, includeFiles);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("id", exportId);
            result.put("fileName", fileName);
            result.put("format", format);
            result.put("fileSize", "1.2MB"); // 模拟文件大小
            result.put("status", "completed");
            result.put("createTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            return Result.success(result);
        } catch (Exception e) {
            return Result.businessError(500, "导出失败: " + e.getMessage());
        }
    }

    /**
     * 生成Excel导出
     */
    private String generateExcelExport(String exportId, List<String> types, String startDate, String endDate) {
        try {
            Workbook workbook = new XSSFWorkbook();
            
            if (types.contains("dept")) {
                generateDeptSheet(workbook);
            }
            if (types.contains("member")) {
                generateMemberSheet(workbook);
            }
            if (types.contains("activity")) {
                generateActivitySheet(workbook, startDate, endDate);
            }
            if (types.contains("message")) {
                generateMessageSheet(workbook, startDate, endDate);
            }

            String fileName = "社团档案_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            // 这里应该保存到文件系统或OSS
            // 为了简化，我们只返回文件名
            workbook.close();
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("生成Excel失败", e);
        }
    }

    /**
     * 生成PDF导出
     */
    private String generatePdfExport(String exportId, List<String> types, String startDate, String endDate) {
        try {
            String fileName = "社团档案_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            String filePath = "./exports/" + fileName;
            
            // 确保导出目录存在
            java.io.File exportDir = new java.io.File("./exports");
            if (!exportDir.exists()) {
                exportDir.mkdirs();
            }
            
            // 创建PDF文档
            PdfDocument pdfDoc = new PdfDocument(new PdfWriter(filePath));
            Document document = new Document(pdfDoc);
            
            // 添加标题
            document.add(new Paragraph("Club Management System - Data Export Report")
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));
            
            // 添加导出时间
            document.add(new Paragraph("Export Time: " + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .setFontSize(12)
                .setMarginBottom(30));
            
            // 根据类型添加内容
            if (types.contains("dept")) {
                addDeptToPdf(document);
            }
            if (types.contains("member")) {
                addMemberToPdf(document);
            }
            if (types.contains("activity")) {
                addActivityToPdf(document, startDate, endDate);
            }
            
            document.close();
            return fileName;
        } catch (Exception e) {
            throw new RuntimeException("PDF生成失败: " + e.getMessage(), e);
        }
    }

    /**
     * 生成ZIP导出
     */
    private String generateZipExport(String exportId, List<String> types, String startDate, String endDate, Boolean includeFiles) {
        // 这里应该生成ZIP文件，包含Excel、PDF和附件
        // 为了简化，我们只返回文件名
        return "社团档案_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".zip";
    }

    /**
     * 生成部门信息Sheet
     */
    private void generateDeptSheet(Workbook workbook) {
        try {
            Sheet sheet = workbook.createSheet("部门信息");
            
            // 创建表头
            Row headerRow = sheet.createRow(0);
            String[] headers = {"部门ID", "部门名称", "排序", "简介", "创建时间"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // 获取部门数据 - 使用更安全的方式
            List<com.club.management.entity.Dept> depts = deptMapper.selectList(null);
            
            // 填充数据
            int rowNum = 1;
            for (com.club.management.entity.Dept dept : depts) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(dept.getId() != null ? dept.getId().toString() : "");
                row.createCell(1).setCellValue(dept.getName() != null ? dept.getName() : "");
                row.createCell(2).setCellValue(dept.getSort() != null ? dept.getSort().toString() : "");
                row.createCell(3).setCellValue(dept.getIntro() != null ? dept.getIntro() : "");
                row.createCell(4).setCellValue(dept.getCreateTime() != null ? dept.getCreateTime().toString() : "");
            }
        } catch (Exception e) {
            System.err.println("生成部门信息Sheet失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 生成成员信息Sheet
     */
    private void generateMemberSheet(Workbook workbook) {
        try {
            Sheet sheet = workbook.createSheet("成员信息");
            
            // 创建表头
            Row headerRow = sheet.createRow(0);
            String[] headers = {"学号", "姓名", "性别", "学院", "专业", "年级", "手机", "邮箱", "入社时间", "部门", "角色"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // 获取成员数据 - 使用更安全的方式
            List<com.club.management.entity.Member> members = memberMapper.selectList(null);
            
            // 填充数据
            int rowNum = 1;
            for (com.club.management.entity.Member member : members) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(member.getStuId() != null ? member.getStuId() : "");
                row.createCell(1).setCellValue(member.getName() != null ? member.getName() : "");
                row.createCell(2).setCellValue(member.getGender() != null ? member.getGender() : "");
                row.createCell(3).setCellValue(member.getCollege() != null ? member.getCollege() : "");
                row.createCell(4).setCellValue(member.getMajor() != null ? member.getMajor() : "");
                row.createCell(5).setCellValue(member.getGrade() != null ? member.getGrade() : "");
                row.createCell(6).setCellValue(member.getPhone() != null ? member.getPhone() : "");
                row.createCell(7).setCellValue(member.getEmail() != null ? member.getEmail() : "");
                row.createCell(8).setCellValue(member.getJoinDate() != null ? member.getJoinDate().toString() : "");
                row.createCell(9).setCellValue(member.getDeptId() != null ? member.getDeptId().toString() : "");
                row.createCell(10).setCellValue(member.getRole() != null ? member.getRole() : "");
            }
        } catch (Exception e) {
            System.err.println("生成成员信息Sheet失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 生成活动信息Sheet
     */
    private void generateActivitySheet(Workbook workbook, String startDate, String endDate) {
        try {
            Sheet sheet = workbook.createSheet("活动信息");
            
            // 创建表头
            Row headerRow = sheet.createRow(0);
            String[] headers = {"活动名称", "类型", "开始时间", "结束时间", "地点", "状态", "创建时间"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // 获取活动数据 - 使用更安全的方式
            List<com.club.management.entity.Activity> activities = activityMapper.selectList(null);
            
            // 填充数据
            int rowNum = 1;
            for (com.club.management.entity.Activity activity : activities) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(activity.getName() != null ? activity.getName() : "");
                row.createCell(1).setCellValue(activity.getType() != null ? activity.getType() : "");
                row.createCell(2).setCellValue(activity.getStartTime() != null ? activity.getStartTime().toString() : "");
                row.createCell(3).setCellValue(activity.getEndTime() != null ? activity.getEndTime().toString() : "");
                row.createCell(4).setCellValue(activity.getLocation() != null ? activity.getLocation() : "");
                row.createCell(5).setCellValue(activity.getStatus() != null ? activity.getStatus().toString() : "");
                row.createCell(6).setCellValue(activity.getCreateTime() != null ? activity.getCreateTime().toString() : "");
            }
        } catch (Exception e) {
            System.err.println("生成活动信息Sheet失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 生成消息信息Sheet
     */
    private void generateMessageSheet(Workbook workbook, String startDate, String endDate) {
        try {
            Sheet sheet = workbook.createSheet("消息记录");
            
            // 创建表头
            Row headerRow = sheet.createRow(0);
            String[] headers = {"消息ID", "接收人", "发送人", "标题", "内容", "状态", "创建时间"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // 获取消息数据 - 使用更安全的方式
            List<com.club.management.entity.SysMessage> messages = sysMessageMapper.selectList(null);
            
            // 填充数据
            int rowNum = 1;
            for (com.club.management.entity.SysMessage message : messages) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(message.getId() != null ? message.getId().toString() : "");
                row.createCell(1).setCellValue(message.getRecipientId() != null ? message.getRecipientId().toString() : "");
                row.createCell(2).setCellValue(message.getSenderId() != null ? message.getSenderId().toString() : "");
                row.createCell(3).setCellValue(message.getTitle() != null ? message.getTitle() : "");
                row.createCell(4).setCellValue(message.getContent() != null ? message.getContent() : "");
                row.createCell(5).setCellValue(message.getStatus() != null ? message.getStatus().toString() : "");
                row.createCell(6).setCellValue(message.getCreateTime() != null ? message.getCreateTime().toString() : "");
            }
        } catch (Exception e) {
            System.err.println("生成消息信息Sheet失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 获取导出历史
     */
    public Result<List<Map<String, Object>>> getExportHistory() {
        // 这里应该从数据库或文件系统获取导出历史
        // 为了简化，我们返回模拟数据
        List<Map<String, Object>> history = new ArrayList<>();
        
        Map<String, Object> record1 = new HashMap<>();
        record1.put("id", "export_1");
        record1.put("fileName", "社团档案_20231201_143022.xlsx");
        record1.put("format", "excel");
        record1.put("fileSize", "1.2MB");
        record1.put("status", "completed");
        record1.put("createTime", "2023-12-01 14:30:22");
        history.add(record1);

        Map<String, Object> record2 = new HashMap<>();
        record2.put("id", "export_2");
        record2.put("fileName", "社团档案_20231201_150015.zip");
        record2.put("format", "zip");
        record2.put("fileSize", "5.8MB");
        record2.put("status", "completed");
        record2.put("createTime", "2023-12-01 15:00:15");
        history.add(record2);

        return Result.success(history);
    }

    /**
     * 下载导出文件
     */
    public void downloadExportFile(String id, HttpServletResponse response) {
        try {
            // 这里应该从文件系统或OSS获取文件
            // 为了简化，我们生成一个示例文件
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=export_" + id + ".xlsx");
            
            // 生成简单的Excel文件
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("导出数据");
            Row row = sheet.createRow(0);
            row.createCell(0).setCellValue("导出ID: " + id);
            row.createCell(1).setCellValue("导出时间: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            
            workbook.write(response.getOutputStream());
            workbook.close();
        } catch (IOException e) {
            throw new RuntimeException("下载文件失败", e);
        }
    }

    /**
     * 删除导出文件
     */
    public Result<String> deleteExportFile(String id) {
        try {
            // 这里应该从文件系统或OSS删除文件
            // 为了简化，我们只返回成功
            return Result.success("删除成功");
        } catch (Exception e) {
            return Result.businessError(500, "删除失败: " + e.getMessage());
        }
    }

    /**
     * 添加部门信息到PDF
     */
    private void addDeptToPdf(Document document) throws Exception {
        document.add(new Paragraph("Department Information")
            .setFontSize(16)
            .setMarginTop(20)
            .setMarginBottom(10));
        
        List<com.club.management.entity.Dept> depts = deptMapper.selectList(null);
        for (com.club.management.entity.Dept dept : depts) {
            document.add(new Paragraph("Department Name: " + dept.getName())
                .setFontSize(12)
                .setMarginBottom(5));
            
            if (dept.getIntro() != null && !dept.getIntro().isEmpty()) {
                document.add(new Paragraph("Introduction: " + dept.getIntro())
                    .setFontSize(10)
                    .setMarginBottom(10));
            }
        }
    }

    /**
     * 添加成员信息到PDF
     */
    private void addMemberToPdf(Document document) throws Exception {
        document.add(new Paragraph("Member Information")
            .setFontSize(16)
            .setMarginTop(20)
            .setMarginBottom(10));
        
        List<com.club.management.entity.Member> members = memberMapper.selectList(null);
        for (com.club.management.entity.Member member : members) {
            document.add(new Paragraph("Name: " + member.getName() + 
                " | Student ID: " + member.getStuId() + 
                " | Role: " + member.getRole())
                .setFontSize(10)
                .setMarginBottom(5));
        }
    }

    /**
     * 添加活动信息到PDF
     */
    private void addActivityToPdf(Document document, String startDate, String endDate) throws Exception {
        document.add(new Paragraph("Activity Information")
            .setFontSize(16)
            .setMarginTop(20)
            .setMarginBottom(10));
        
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.club.management.entity.Activity> queryWrapper = 
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        
        if (startDate != null && !startDate.isEmpty()) {
            queryWrapper.ge("start_time", startDate);
        }
        if (endDate != null && !endDate.isEmpty()) {
            queryWrapper.le("start_time", endDate);
        }
        
        List<com.club.management.entity.Activity> activities = activityMapper.selectList(queryWrapper);
        for (com.club.management.entity.Activity activity : activities) {
            document.add(new Paragraph("Activity Name: " + activity.getName() + 
                " | Type: " + activity.getType() + 
                " | Time: " + activity.getStartTime())
                .setFontSize(10)
                .setMarginBottom(5));
        }
    }
}
