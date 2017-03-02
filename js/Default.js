var grid;
var gridt;
var searchWin;
var consumedate;
$(function () {
    $('#btn-search,#btn-search-cancel').linkbutton();
    searchWin = $('#search-window').window({
        closed: true,
        modal: false
    });
    $('#btnupdate').hide();
    $('#cld,#cld1,#cld2').calendar({
        onSelect: function (date) {
            var cldid = this.id;
            if (cldid == "cld") {
                selectCalendar(date);
            }
            else {
                var fdate = date.Format('yyyy-MM-dd');
                $("#txt" + cldid).val(fdate);
                filterGrid();
            }
        }
    });
    $('#Category,#CategoryFilter').combobox({
        url: 'json/Category.json',
        valueField: 'id',
        textField: 'text'
    });
    $('#SubCategory,#SubCategoryFilter,#cg').combobox({
        url: 'ajax/AccountBook.ashx?action=getsubCategory&Category=' + $('#Category').val(),
        valueField: 'id',
        textField: 'text'
    });
    consumedate = $('#ConsumeDate').datebox({

    });
    var fdatenow = new Date().Format('yyyy-MM-dd');
    consumedate.datebox('setValue', fdatenow);
    var lastIndex;
    grid = $('#grid').datagrid({
        methord: 'get',
        url: 'ajax/AccountBook.ashx?action=default&ran=' + Math.random(),
        sortName: 'ConsumeDate',
        sortOrder: 'desc',
        idField: 'RecordID',
        frozenColumns: [[
                            { field: 'ck', checkbox: true }
                        ]],
        columns: [[
                            { field: 'ConsumeDate', title: '记账日期', width: 60, sortable: true, editor: 'text' },
                            { field: 'ConsumeAmount', title: '记账金额', width: 60, sortable: true, editor: 'numberbox', align: 'right' },
                            { field: 'SubCategory', title: '记账小类', width: 80, sortable: true, editor: 'text' },
                            { field: 'Category', title: '记账大类', width: 40, sortable: true, editor: 'text' },
                            { field: 'AccountTips', title: '记账描述', width: 140, editor: 'textarea' },
                            { field: 'RecordDate', title: '录入时间', width: 80 },
                            { field: 'action', title: 'Action', width: 30, align: 'center',
                                formatter: function (value, row, index) {
                                    if (row.SubCategory != "合计:") {
                                        if (row.editing) {
                                            var s = '<a href="#" onclick="saverow(' + index + ')">Save</a> ';
                                            var c = '<a href="#" onclick="cancelrow(' + index + ')">Cancel</a>';
                                            return s + c;
                                        } else {
                                            var e = '<a href="#" onclick="editrow(' + index + ')">Edit</a> ';
                                            var d = '<a href="#" onclick="del(' + row.RecordID + ')">Delete</a>';
                                            return e + d;
                                        }
                                    }
                                }
                            }
                        ]],
        showFooter: true,
        fit: true,
        striped: true,
        rownumbers: true,
        fitColumns: true,
        toolbar: [{
            text: '删除',
            iconCls: 'icon-remove',
            handler: delSelected
        }, '-', {
            text: '查询',
            iconCls: 'icon-search',
            handler: OpensearchWin
        }, '-', {
            text: '所有',
            iconCls: 'icon-reload',
            handler: showAll
        }, '-', {
            text: '保存更改',
            iconCls: 'icon-save',
            handler: savechange
        }, '-'
                ],
        onClickRow: function (rowIndex, rowData) {
            editAccount(rowData.RecordID);
        },
        onBeforeEdit: function (index, row) {
            row.editing = true;
            $('#grid').datagrid('refreshRow', index);
        },
        onAfterEdit: function (index, row) {
            row.editing = false;
            $('#grid').datagrid('refreshRow', index);
        },
        onCancelEdit: function (index, row) {
            row.editing = false;
            $('#grid').datagrid('refreshRow', index);
        },
        onLoadSuccess: function () {
            $('.datagrid-toolbar').append($('#searchTool'));
            $('#searchTool').show();
        }
    });
    gridt = $('#gridt').datagrid({
        methord: 'get',
        url: 'ajax/AccountBook.ashx?action=default&ran=' + Math.random(),
        sortName: 'Category',
        sortOrder: 'asc',
        pageSize: 30,
        columns: [[
                            { field: 'Category', title: '记账大类', width: 40, sortable: true },
                            { field: 'SubCategory', title: '记账小类', width: 80, sortable: true },
                            { field: 'ConsumeAmount', title: '记账金额', width: 60, sortable: true, align: 'right' }
                     ]],
        showFooter: true,
        fit: true,
        rownumbers: true,
        fitColumns: true
    });
    $('body').layout();
});
function editrow(index) {
    grid.datagrid('beginEdit', index);
}
function deleterow(index) {
    $.messager.confirm('Confirm', 'Are you sure?', function (r) {
        if (r) {
            grid.datagrid('deleteRow', index);
        }
    });
}
function saverow(index) {
    grid.datagrid('endEdit', index);
    savechange();
}
function cancelrow(index) {
    grid.datagrid('cancelEdit', index);
}
function savechange() {
    var rows = grid.datagrid('getChanges');
    if (rows.length > 0) {
        var account = {
            'action': 'saveinline',
            'RecordID': rows[0].RecordID,
            'ConsumeDate': rows[0].ConsumeDate,
            'ConsumeAmount': rows[0].ConsumeAmount,
            'Category': rows[0].Category,
            'SubCategory': rows[0].SubCategory,
            'AccountTips': rows[0].AccountTips
        }
        $.post('ajax/AccountBook.ashx',
            account,
            function (result) {
                
            }
        );
    }
    grid.datagrid('acceptChanges');
}
function filterGrid() {
    var date1 = $("#txtcld1").val();
    var date2 = $("#txtcld2").val();
    if (date1.length > 0 & date2.length > 0) {
        $('#grid').datagrid('options').url = 'ajax/AccountBook.ashx?action=filter&date1=' + date1 + '&date2=' + date2;
        $('#grid').datagrid("reload");
        $('#gridt').datagrid('options').url = 'ajax/AccountBook.ashx?action=filter&date1=' + date1 + '&date2=' + date2;
        $('#gridt').datagrid("reload");
//        grid.datagrid({ url: 'ajax/AccountBook.ashx?action=filter&date1=' + date1 + '&date2=' + date2 });
//        gridt.datagrid({ url: 'ajax/AccountBook.ashx?action=filter&date1=' + date1 + '&date2=' + date2 });
    }
}
function selectCalendar(date) {
    var fdate = date.Format('yyyy-MM-dd');
    consumedate.datebox('setValue', fdate);
    $('#grid').datagrid('options').url = 'ajax/AccountBook.ashx?action=get&date=' + fdate;
    $('#grid').datagrid("reload");
    $('#gridt').datagrid('options').url = 'ajax/AccountBook.ashx?action=get&date=' + fdate;
    $('#gridt').datagrid("reload");
//    grid.datagrid({ url: 'ajax/AccountBook.ashx?action=get&date=' + fdate });
//    gridt.datagrid({ url: 'ajax/AccountBook.ashx?action=get&date=' + fdate });
}
function editAccount(id) {
    $('#ff').form('load', 'ajax/AccountBook.ashx?action=getsingle&id=' + id);
    $('#ff').form.url = 'ajax/AccountBook.ashx?action=save&id=' + id;
    $('#btnupdate').show();
}
function addAccount() {
    $('#ff').form.url = 'ajax/AccountBook.ashx?action=save';
    saveAccount();
    $('#btnupdate').hide();
}
function saveAccount() {
    $('#ff').form('submit', {
        url: $('#ff').form.url,
        onSubmit: function () {
            return $(this).form('validate');
        },
        success: function (data) {
            eval('data=' + data);
            if (data.success) {
                grid.datagrid('reload');
                gridt.datagrid('reload');
            } else {
                $.messager.alert('错误', data.msg, 'error');
            }
        }
    });
}
function OpensearchWin() {
    searchWin.window('open');
}
function toolSearch() {
    var txt = $('#txtSearch').val();
    if (txt.length > 0) {
        $('#grid').datagrid('options').url = 'ajax/AccountBook.ashx?action=query&search=' + escape(txt);
        $('#grid').datagrid("reload");
        $('#gridt').datagrid('options').url = 'ajax/AccountBook.ashx?action=query&search=' + escape(txt);
        $('#gridt').datagrid("reload");
    }
}
function SearchOK() {
    grid.datagrid({ url: 'ajax/AccountBook.ashx?action=filter',
        queryParams: { date1: $('#date1').val() }
    });
}
function closeSearchWindow() {
    searchWin.window('close');
}
function showAll() {
    grid.datagrid({ url: 'ajax/AccountBook.ashx?action=get' });
    gridt.datagrid({ url: 'ajax/AccountBook.ashx?action=get' });
}
function delSelected() {
    var arr = getSelectedArr();
    if (arr.length > 0) {
        del(arr.join(','));
    } else {
        $.messager.show({
            title: '提示',
            msg: '请先选择要删除的记录。',
            showType: 'show'
        });
    }
}
function del(ids) {
    $.messager.confirm('提示信息', '您确认要删除吗?', function (data) {
        if (data) {
            $.ajax({
                url: 'ajax/AccountBook.ashx?action=del&id=' + ids,
                type: 'GET',
                timeout: 1000,
                error: function () {
                    $.messager.alert('错误', '删除失败!', 'error');
                },
                success: function (data) {
                    eval('data=' + data);
                    if (data.success) {
                        grid.datagrid('reload');
                        grid.datagrid('clearSelections');
                        gridt.datagrid('reload');
                    } else {
                        $.messager.alert('错误', data.msg, 'error');
                    }
                }
            });
        }
    });
}
function getSelectedArr() {
    var ids = [];
    var rows = grid.datagrid('getSelections');
    for (var i = 0; i < rows.length; i++) {
        ids.push(rows[i].RecordID);
    }
    return ids;
}