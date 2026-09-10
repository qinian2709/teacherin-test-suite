/** MeterSphere 原场景名 + 去重后的接口清单。步骤实现不跟 MS 走，由用例自己补。 */

export interface ScenarioApi {
  method: string;
  path: string;
  name: string;
}

export interface ScenarioCatalogItem {
  name: string;
  flow: 'personal-course' | 'org-course' | 'other';
  apis: ScenarioApi[];
}

export const SCENARIO_CATALOG: ScenarioCatalogItem[] = [
  {
    "name": "组织空间：创建课程+保存模板+模板创建课程+删除模板+删除课程",
    "flow": "org-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/repos",
        "name": "组织创建课程-商家"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/template",
        "name": "课程保存为模版"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/repos/template",
        "name": "组织空间获取课程模板"
      },
      {
        "method": "GET",
        "path": "/repositories/{id}/template",
        "name": "课程模板预览（查看模板详情）"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/template/patch",
        "name": "重命名模版名称"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/exist",
        "name": "判断课程是否有可读权限并返回课程详情"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/admin/publish",
        "name": "管理员发布普通课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/publish/cancel",
        "name": "课程取消发布"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除个人课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/template/delete",
        "name": "删除模版"
      }
    ]
  },
  {
    "name": "邀请成员加入组织-获取成员列表-修改成员角色-移除成员",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user/search",
        "name": "邀请成员加入组织-通过手机号获取用户信息"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/members",
        "name": "邀请成员加入组织"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/members",
        "name": "获取组织成员list"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/members/patch",
        "name": "更新组织成员昵称、角色"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/promote/batch",
        "name": "批量设置组织成员角色-设置普通成员"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/members/{userid}/delete",
        "name": "将成员移除组织"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/members/batch",
        "name": "批量添加组织成员"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/batch/delete",
        "name": "批量移除组织成员"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/invite",
        "name": "邀请用户加入特定组织"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/invite/patch",
        "name": "刷新邀请组织成员链接"
      },
      {
        "method": "GET",
        "path": "/orgs/invite/check",
        "name": "检查邀请链接"
      }
    ]
  },
  {
    "name": "收藏课程-收藏列表查询-取消收藏",
    "flow": "other",
    "apis": [
      {
        "method": "POST",
        "path": "/user/starred/{repo_id}/put",
        "name": "收藏-正向"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/goods",
        "name": "查询商品信息"
      },
      {
        "method": "GET",
        "path": "/user/repos",
        "name": "查询-我的收藏正向"
      },
      {
        "method": "POST",
        "path": "/user/starred/{repoid}/delete",
        "name": "取消收藏-正向"
      }
    ]
  },
  {
    "name": "新建课程-重命名-置顶-保存为模版-删除",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/user/repo/{repoid}/top",
        "name": "置顶个人空间课程"
      },
      {
        "method": "POST",
        "path": "/user/repo/{repoid}/untop",
        "name": "取消个人课程置顶"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/name",
        "name": "重命名个人空间课程名称"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/template",
        "name": "课程保存为模版"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/exist",
        "name": "判断课程是否有可读权限并返回课程详情"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "验证模版数量-获取个人/平台模版列表-重命名个人模版-删除模版",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user/repos/template/count",
        "name": "个人工作台-获取模版数量"
      },
      {
        "method": "GET",
        "path": "/user/repos/template",
        "name": "获取个人模版列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/template/patch",
        "name": "重命名模版名称"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/template/delete",
        "name": "删除模版"
      }
    ]
  },
  {
    "name": "创建个人课程-搜索用户-添加协作者-查看协作者列表-修改协作者权限-删除协作者-删除课程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/invite/users/search",
        "name": "协作邀请用户搜索"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/collaborators/put",
        "name": "添加课程协作者"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/collaborators",
        "name": "查看课程协作者列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/collaborators/{collaborator_uid}",
        "name": "个人空间修改协作者权限"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/collaborators/{collaborator_uid}/delete",
        "name": "删除课程协作者"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "组织创建课程-组织成员列表-添加协作者-查看协作者列表-组织空间修改协作者权限-邀请团队协作-查看课程协作者列表-复制邀请链接-删除协作者-删除课程",
    "flow": "org-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/repos",
        "name": "组织创建课程-非商家"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/members/search",
        "name": "组织成员列表"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/share/mode",
        "name": "课程邀请链接分享方式"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/collaborators/put",
        "name": "添加课程协作者"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/collaborators",
        "name": "查看课程协作者列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/collaborators/{collaborator_uid}",
        "name": "组织空间修改协作者权限"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/share/teams",
        "name": "邀请团队协作"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/invite/open",
        "name": "开启链接邀请"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/invite/token",
        "name": "复制课程邀请链接"
      },
      {
        "method": "GET",
        "path": "/repos/collaborators/invite",
        "name": "获取课程协作邀请信息"
      },
      {
        "method": "POST",
        "path": "/repos/collaborators/invite/check",
        "name": "检查协作邀请token是否有效"
      },
      {
        "method": "POST",
        "path": "/repos/collaborators/join",
        "name": "加入课程协作者"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/invite/off",
        "name": "关闭链接邀请"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/collaborators/{collaborator_uid}/delete",
        "name": "删除课程协作者"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "TI-云盘相关",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}",
        "name": "获取课程信息"
      },
      {
        "method": "GET",
        "path": "/file/cloud/list/{folderId}",
        "name": "获取云盘根目录文件A、文件夹B"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos/batch",
        "name": "上传云盘文件C、D到课程"
      },
      {
        "method": "GET",
        "path": "/file/cloud/breadcrumb",
        "name": "获取云盘文件面包屑"
      },
      {
        "method": "GET",
        "path": "/file/cloud/search",
        "name": "搜索文件C"
      },
      {
        "method": "POST",
        "path": "/file/cloud/preview",
        "name": "预览云盘文件C（ecos类型）"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/contents",
        "name": "获取课程文件列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/thumbnail",
        "name": "获取文件缩略图"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/preview/batch",
        "name": "课程文件预览"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/download/batch",
        "name": "课程文件下载"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/transform",
        "name": "打印的时候需要把文件转换成 PDF 进行打印"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/transform/get",
        "name": "轮询，打印的时候需要把文件转换成 PDF 进行打印"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "组织机构打通",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/{orgid}/eeo",
        "name": "验证名下是否有机构"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/eeo/reflect",
        "name": "组织绑定超管名下的机构"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}",
        "name": "获取组织信息_验证操作生效"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/eeo/teachers",
        "name": "获取机构下的教师列表"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/eeo/unbind",
        "name": "组织解绑机构"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/settings",
        "name": "组织设置-打开组织成员可以发布自己获取课程开关"
      }
    ]
  },
  {
    "name": "新建课程-课程标签联想-添加标签-获取标签列表-删除标签-删除课程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/topics/lenovo",
        "name": "课程标签联想"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/topics/single/put",
        "name": "课程添加一个标签"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/topics",
        "name": "获取课程的标签列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/topics/single/delete",
        "name": "课程删除一个标签"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "查询本人信息-查询全部二级标签-修改本人信息",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user/settings",
        "name": "查询个人信息"
      },
      {
        "method": "GET",
        "path": "/topics/category",
        "name": "查询二级标签"
      },
      {
        "method": "POST",
        "path": "/user/settings/patch",
        "name": "更新修改个人信息"
      }
    ]
  },
  {
    "name": "组织数据相关",
    "flow": "org-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/repos",
        "name": "组织创建课程-非商家"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/repo",
        "name": "组织数据-获取课程总数"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/member",
        "name": "组织数据-成员数据"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/login/member",
        "name": "组织数据-成员使用情况"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/cap",
        "name": "组织数据-组织空间使用详情"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/member/repo",
        "name": "组织数据-成员课程数据"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/new_repo/7",
        "name": "组织数据近7/30天新增课程"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/new_repo/30",
        "name": "组织数据近7/30天新增课程"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/update_repo/7",
        "name": "组织数据-近7/30天更新课程次数"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/update_repo/30",
        "name": "组织数据-近7/30天更新课程次数"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/fork/rank/7",
        "name": "组织数据-近7/30天被获取数排行"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/fork/rank/30",
        "name": "组织数据-近7/30天被获取数排行"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/star/rank/7",
        "name": "组织数据-近7/30天被收藏数排行"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/star/rank/30",
        "name": "组织数据-近7/30天被收藏数排行"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/apply/rank/7",
        "name": "组织数据-近7/30天被应用数排行"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/apply/rank/30",
        "name": "组织数据-近7/30天被应用数排行"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/active_member/7",
        "name": "组织数据-近7/30天活跃人数"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/active_member/30",
        "name": "组织数据-近7/30天活跃人数"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/new/repo/rank/7",
        "name": "组织数据-近7/30天组织成员新建课程数量排行榜"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/new/repo/rank/30",
        "name": "组织数据-近7/30天组织成员新建课程数量排行榜"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/star/{repo_id}/7",
        "name": "组织数据-获取某一课程近7/30天被收藏数量"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/star/{repo_id}/30",
        "name": "组织数据-获取某一课程近7/30天被收藏数量"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/new/repo/{creator_id}/7",
        "name": "组织数据-某成员近7/30天新建课程趋势"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/new/repo/{creator_id}/30",
        "name": "组织数据-某成员近7/30天新建课程趋势"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/update/repo/rank/7",
        "name": "组织数据-近7/30天组织成员更新课程次数排行榜"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/update/repo/rank/30",
        "name": "组织数据-近7/30天组织成员更新课程次数排行榜"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/update/repo/{creator_id}/7",
        "name": "组织数据-某成员近7/30天更新课程趋势"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/stat/update/repo/{creator_id}/30",
        "name": "组织数据-某成员近7/30天更新课程趋势"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/admin/delete",
        "name": "组织管理员删除课程"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/members/count",
        "name": "获取组织成员数量"
      }
    ]
  },
  {
    "name": "未登录-进入个人主页-查询用户所属组织-查询用户信息相关",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      },
      {
        "method": "GET",
        "path": "/users/{id}/orgs",
        "name": "未登录查看某个用户所属组织"
      },
      {
        "method": "GET",
        "path": "/users/{userid}",
        "name": "获取某个用户信息"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/repos/count",
        "name": "获取个人用户的课程数量相关数据"
      }
    ]
  },
  {
    "name": "获取个人关注列表-取关-关注-获取关注者列表",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      },
      {
        "method": "GET",
        "path": "/user/following/{userid}/count",
        "name": "获取用户的关注数和粉丝数"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/following",
        "name": "获取用户关注列表"
      },
      {
        "method": "POST",
        "path": "/user/following/{userid}/delete",
        "name": "取消关注个人"
      },
      {
        "method": "POST",
        "path": "/user/following/{userid}/put",
        "name": "关注个人"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/followers",
        "name": "获取关注者列表"
      }
    ]
  },
  {
    "name": "新建课程-新建评分方案-编辑评分方案-获取评价方案列表删除评分方案-删除课程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cs/create",
        "name": "新建评分方案"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cs/update",
        "name": "修改评分方案"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/cs",
        "name": "获取评分方案列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cs/delete",
        "name": "删除评分方案"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "新建课程-创建素养量规-更新素养量规-获取素养量规列表-获取模型详情-检查模型是否被引用-删除指定模型-删除课程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lit2/create",
        "name": "创建素养模型"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lit2/update",
        "name": "更新素养模型"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/lit2/list",
        "name": "获取课程素养能力模型列表"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/lit2/detail/{model_id}",
        "name": "获取素养能力模型详情"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lit2/detection",
        "name": "检查某些模型是否被引用"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lit2/delete/{model_id}",
        "name": "删除指定模型数据"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "已登录--修改个人背景图--获取个人动态列表-查询发布的课程列表-查询收藏的课程列表-接口搜索",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      },
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询背景图"
      },
      {
        "method": "POST",
        "path": "/user/background",
        "name": "修改个人背景图"
      },
      {
        "method": "GET",
        "path": "/users/{userid}",
        "name": "获取某个用户信息"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/community",
        "name": "查询用户动态 列表"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/repos/count",
        "name": "获取个人用户的课程数量相关数据"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/repos",
        "name": "个人用户下查询发布和收藏课程"
      }
    ]
  },
  {
    "name": "动态列表-点赞-取消点赞-热门课程列表换一换-作者推荐列表换一换",
    "flow": "other",
    "apis": [
      {
        "method": "POST",
        "path": "/user/settings/notice",
        "name": "打开社区动态通知"
      },
      {
        "method": "GET",
        "path": "/community",
        "name": "正常-获取社区动态列表"
      },
      {
        "method": "POST",
        "path": "/community/{communityid}/starred",
        "name": "点赞社区动态"
      },
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      },
      {
        "method": "POST",
        "path": "/community/{communityid}/delete",
        "name": "取消点赞社区动态"
      },
      {
        "method": "GET",
        "path": "/community/recommend/repo",
        "name": "动态-推荐课程列表"
      },
      {
        "method": "GET",
        "path": "/community/recommend/author",
        "name": "动态推荐作者列表查询"
      }
    ]
  },
  {
    "name": "获取课程封面-创建组织课程-修改背景--删除",
    "flow": "org-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/repos",
        "name": "组织创建课程-非商家"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/background",
        "name": "更换课程背景"
      },
      {
        "method": "GET",
        "path": "/repositories/{id}",
        "name": "获取课程仓库详情"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "新建课程-新建文件夹-重命名文件夹名-删除课程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/contents/gitkeep",
        "name": "新建文件夹"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos/dir/put",
        "name": "重命名文件夹名"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "商家-分销商品列表操作",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/{orgid}/merchant",
        "name": "获取商家信息（组织Id）"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/admin/distribution/list",
        "name": "分销商品-获取分销商品列表（组织Id）"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/admin/distribution/list/to_add",
        "name": "分销商品-获取待添加推广商品列表（组织Id）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/admin/distribution/add",
        "name": "分销商品-添加分销商品（组织Id）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/admin/distribution/rate",
        "name": "分销商品-设置分销商品佣金比例（组织Id）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/admin/distribution/cond",
        "name": "分销商品-设置个人推广条件（组织Id）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/admin/distribution/remove/{goods_id}",
        "name": "分销商品-删除推广商品（组织Id）"
      }
    ]
  },
  {
    "name": "商家-买家列表添加交付删除",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/{orgid}/license",
        "name": "买家列表-获取个人账号列表（组织Id）"
      },
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license",
        "name": "买家列表-添加个人账号（组织Id）"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/repos",
        "name": "买家列表-获取待授权课程（组织Id）-应用人数"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license/repos",
        "name": "买家列表-给添加的个人账号交付课程（组织Id）-应用人数"
      },
      {
        "method": "GET",
        "path": "/user/repos",
        "name": "个人空间-工作台各课程列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除个人课程"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license/{id}/delete",
        "name": "买家列表-删除已添加的个人账号（组织Id）"
      }
    ]
  },
  {
    "name": "未登录组织主页-组织信息获取-组织发布课程列表-搜索-关注组织-取关组织",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/{orgid}",
        "name": "未登录-获取组织信息"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/members",
        "name": "未登录-查看组织成员列表"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/repos",
        "name": "获取组织主页全部课程"
      },
      {
        "method": "POST",
        "path": "/user/following/{userid}/put",
        "name": "关注组织"
      },
      {
        "method": "POST",
        "path": "/user/following/{userid}/delete",
        "name": "取消关注组织"
      }
    ]
  },
  {
    "name": "组织课程授权给个人",
    "flow": "org-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/repos",
        "name": "组织创建课程-非商家"
      },
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license",
        "name": "授权-添加个人账号"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/license",
        "name": "买家列表-获取个人账号列表（组织Id）"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/repos",
        "name": "买家列表-获取待授权课程（组织Id）-应用人数"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license/repos",
        "name": "授权-给添加的个人账号授权课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/license/repos",
        "name": "授权-获取指定用户授权记录"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license/{id}/delete",
        "name": "买家列表-删除已添加的个人账号（组织Id）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license/repos/{licenseid}/patch",
        "name": "授权-终止授权课程"
      },
      {
        "method": "GET",
        "path": "/notifications",
        "name": "授权-用户获取授权通知"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/license/repos/{licenseid}/delete",
        "name": "删除授权记录"
      },
      {
        "method": "POST",
        "path": "/notifications/del",
        "name": "授权-删除全部消息"
      },
      {
        "method": "POST",
        "path": "/notifications/read",
        "name": "授权-设置单个消息已读"
      },
      {
        "method": "GET",
        "path": "/user/repos",
        "name": "个人空间-工作台各课程列表"
      }
    ]
  },
  {
    "name": "组织-导入个人空间课程-删除",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/user/repos",
        "name": "导入课程-可导入的个人课程列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/import/orgs/{orgid}",
        "name": "组织公共区导入课程"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/repos",
        "name": "组织公共区课程查询"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除组织课程"
      }
    ]
  },
  {
    "name": "新建团队-添加团员--修改团队信息-团队列表-转让负责人-退出团队-解散团队",
    "flow": "other",
    "apis": [
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams",
        "name": "创建团队"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{team_name}/exist",
        "name": "判断团队名称是否已存在"
      },
      {
        "method": "GET",
        "path": "/user/search",
        "name": "查询用户信息（手机号查询）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{teamid}/members/account/add",
        "name": "邀请添加团队成员20250717"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/teams/{teamid}/setting",
        "name": "查询团队信息"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{teamid}/setting",
        "name": "修改团队名称"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/teams/{teamid}/members",
        "name": "查询团队成员列表"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{teamid}/members/delete",
        "name": "移除团队成员"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{teamid}/members/promote",
        "name": "团队转让管理员"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{teamid}/members/quit",
        "name": "主动退出团队"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/members/search",
        "name": "查询组织成员列表（返回列表）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{teamid}/members/add",
        "name": "新增团队成员（批量）"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/delete/batch",
        "name": "批量移除团队成员"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/members",
        "name": "获取组织成员list"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/members/{userid}/delete",
        "name": "将成员移除组织"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/teams/{teamid}/delete",
        "name": "解散团队"
      }
    ]
  },
  {
    "name": "用户访问工作台全流程",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user/history/view/{platform}",
        "name": "获取用户上次访问的空间"
      },
      {
        "method": "GET",
        "path": "/notifications/status",
        "name": "用户获取通知状态（红点）"
      },
      {
        "method": "GET",
        "path": "/capacity",
        "name": "获取个人空间存储使用情况"
      },
      {
        "method": "GET",
        "path": "/user/orgs",
        "name": "获取用户名下的组织"
      },
      {
        "method": "GET",
        "path": "/user/rec/status",
        "name": "获取用户推荐状态"
      },
      {
        "method": "GET",
        "path": "/user/rec/repos",
        "name": "工作台推荐课程"
      },
      {
        "method": "POST",
        "path": "/user/rec/close",
        "name": "关闭工作台推荐"
      },
      {
        "method": "GET",
        "path": "/webconfig",
        "name": "获取用户白名单"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/teams",
        "name": "获取组织团队列表"
      },
      {
        "method": "POST",
        "path": "/user/history/view/{platform}",
        "name": "记忆访问的组织"
      },
      {
        "method": "GET",
        "path": "/capacity/{user_id}",
        "name": "获取组织空间使用情况"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/members/my-info",
        "name": "获取用户在组织内的info"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/settings",
        "name": "获取组织设置"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/statistics",
        "name": "获取组织成员、团队数量"
      },
      {
        "method": "GET",
        "path": "/system/agreement/list",
        "name": "获取平台所有协议"
      },
      {
        "method": "GET",
        "path": "/system/agreement",
        "name": "查看协议详情"
      }
    ]
  },
  {
    "name": "在TI内搜索-课程-文件-用户-组织",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/search/count",
        "name": "TI内全局搜索数量"
      },
      {
        "method": "POST",
        "path": "/system/cut_word",
        "name": "获取分词列表"
      },
      {
        "method": "GET",
        "path": "/repos/search",
        "name": "TI内全局搜索-课程"
      },
      {
        "method": "GET",
        "path": "/files/search",
        "name": "TI内全局搜索-文件"
      },
      {
        "method": "GET",
        "path": "/users/search",
        "name": "TI内全局搜索-作者"
      },
      {
        "method": "GET",
        "path": "/orgs/search",
        "name": "TI内全局搜索-组织"
      }
    ]
  },
  {
    "name": "在当前作者-搜索课程、文件",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/search/count",
        "name": "作者下课程、文件数量"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/repos",
        "name": "当前作者内-搜索课程"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/files/count",
        "name": "作者内搜索-不同文件个数"
      },
      {
        "method": "GET",
        "path": "/users/{userid}/files",
        "name": "作者内搜索-文件列表"
      }
    ]
  },
  {
    "name": "商家-分销记录：导出记录",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/merchant/{merchatid}/distribution/order",
        "name": "获取商家分销记录（商户Id）"
      }
    ]
  },
  {
    "name": "商家-推广中心：推广记录&推广商品",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/{orgid}/admin/distribution/promotion",
        "name": "推广中心-获取推广记录（组织Id）"
      },
      {
        "method": "GET",
        "path": "/merchant/{merchatid}/spread/goods",
        "name": "获取推广商品列表（商户Id）"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/goods/spread/info",
        "name": "商家-推广中心：推广"
      }
    ]
  },
  {
    "name": "新建单元-编辑单元-加锁释放锁-移动位置-复制单元-删除单元",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/contents/{filepath}",
        "name": "获取课程lms内容"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms",
        "name": "新建单元"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms/lock",
        "name": "编辑单元活动加锁"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms/put",
        "name": "编辑单元"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms/lock/delete",
        "name": "释放锁"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms/move",
        "name": "移动单元位置"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms/copy",
        "name": "复制单元-包含活动文件"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms/delete",
        "name": "删除单元"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "在当前组织内搜索-课程-文件-作者",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/{orgid}/search/count",
        "name": "当前组织内-课程、文件、作者数量"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/repos",
        "name": "当前组织内-课程搜索"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/files/count",
        "name": "当前组织内-文件类型总数"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/files",
        "name": "当前组织内-文件搜索"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/users",
        "name": "在当前组织内-作者搜索"
      }
    ]
  },
  {
    "name": "商家-推广员：推广记录&分销记录",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/{orgid}/salers",
        "name": "商家-推广员列表"
      },
      {
        "method": "GET",
        "path": "/merchant/{merchatid}/distribution/order",
        "name": "推广员-分销记录（商户Id）"
      }
    ]
  },
  {
    "name": "历史记录相关",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/contents_lms",
        "name": "获取lms list（教学方案页面引用）"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms/put",
        "name": "编辑单元"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/commits/poly",
        "name": "获取课程历史记录"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/reset",
        "name": "恢复版本"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/commits/clear",
        "name": "清空历史记录"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "获取平台能力模型-查看详情-导入课程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/repos/lit2/platform",
        "name": "获取平台模型列表"
      },
      {
        "method": "GET",
        "path": "/repos/lit2/platform/{model_id}",
        "name": "查看平台模型内容"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lit2/create",
        "name": "导入平台模型"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "中文-不同频道列表加载",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/channel/list",
        "name": "获取频道列表"
      },
      {
        "method": "GET",
        "path": "/banner",
        "name": "中文-获取某一频道的轮播图"
      },
      {
        "method": "GET",
        "path": "/explore",
        "name": "中文-获取不同频道默认栏目"
      },
      {
        "method": "GET",
        "path": "/repos/hot_words",
        "name": "中文-获取不同频道的热门搜索词"
      }
    ]
  },
  {
    "name": "探索页-二级页面加载",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/topics/cas/{pid}",
        "name": "获取级联标签"
      },
      {
        "method": "GET",
        "path": "/repos/search/keywords",
        "name": "探索页-某标签下的全部课程(按商品销量排序)"
      },
      {
        "method": "GET",
        "path": "/users/channel",
        "name": "获取当前用户默认频道"
      },
      {
        "method": "GET",
        "path": "/explore",
        "name": "获取指定频道默认栏目"
      },
      {
        "method": "GET",
        "path": "/catalog/{catalog_id}",
        "name": "copy_查询栏目详情"
      },
      {
        "method": "GET",
        "path": "/catalog/{catalog_id}/repo/list",
        "name": "获取某栏目下的课程列表"
      }
    ]
  },
  {
    "name": "在线文档&eppt",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/newbee/auth",
        "name": "教学方案获取newbee鉴权"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/contents_lms",
        "name": "获取lms list（教学方案页面引用）"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/newbee/snapshot",
        "name": "创建教学方案快照"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/newbee/create",
        "name": "新建在线文档"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/eppt/new",
        "name": "新建eppt"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/eppt/edit",
        "name": "编辑eppt"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "设置文件下载状态-下载文件",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/file/cloud/list/{folderId}",
        "name": "获取云盘文件夹B下的文件C"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos/batch",
        "name": "上传云盘文件C、D到课程"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/files",
        "name": "在课程内搜索课程文件"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/contents",
        "name": "获取课程列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos/apply/batch",
        "name": "另存文件至课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/download",
        "name": "下载文件（单个）"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/permissions/files",
        "name": "修改文件下载权限"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/permissions/batch",
        "name": "批量查询文件下载权限"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程_目标课程"
      }
    ]
  },
  {
    "name": "创建个人课程-创建课程副本-删除课程-删除副本课程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/desc",
        "name": "编辑课程描述"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/copy",
        "name": "创建副本课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "试卷相关",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/system/classin_access_token",
        "name": "新建试卷时获取访问Classin资源"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos",
        "name": "上传试卷到课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/contents",
        "name": "获取课程文件列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos/put",
        "name": "编辑试卷"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/contents/gitkeep",
        "name": "新建文件夹"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos/put/batch",
        "name": "单个移动文件位置"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "升级空间相关场景",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/order/list",
        "name": "获取空间当前订单"
      },
      {
        "method": "GET",
        "path": "/order/list/history",
        "name": "获取历史空间订单"
      },
      {
        "method": "GET",
        "path": "/product/list",
        "name": "获取空间产品列表"
      }
    ]
  },
  {
    "name": "获取组织列表-获取模板数量-获取工作台课程数量-组织用户搜索",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user/orgs",
        "name": "获取用户名下的组织"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/merchant/account/deposit/info",
        "name": "获取商家保证金账户"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/patch",
        "name": "编辑组织"
      },
      {
        "method": "GET",
        "path": "/orgs/{orgid}/merchantstatus",
        "name": "组织申请成为商家的状态"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/repos/template/count",
        "name": "获取第一个组织工作台课程模板数量"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/repos/count",
        "name": "获取组织工作台的课程数量"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/users",
        "name": "组织用户搜索"
      }
    ]
  },
  {
    "name": "商品展示页-加载流程",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/repos/search/keywords",
        "name": "获取销量排行榜"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/goods/permissions",
        "name": "返回用户对商品的权限"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/goods",
        "name": "查询商品信息"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/recRepos",
        "name": "商品展示页下的课程推荐"
      },
      {
        "method": "GET",
        "path": "/user/starred/{repo_id}",
        "name": "查询当前用户是否收藏商品"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/rating/top",
        "name": "查询课程的前几个评价"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/goods_lms",
        "name": "查询概览页商品的lms前几个内容"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/goods_lms/all",
        "name": "获取商品页-课程设计"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/contents_lms/detail",
        "name": "返回lms课程内容"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/goods/newbee/auth",
        "name": "商品页获取newbee信息"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/rating",
        "name": "获取商品页评价列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/goods_content",
        "name": "查询商品概览-课程文件"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/share",
        "name": "转发课程"
      }
    ]
  },
  {
    "name": "管理员操作课程",
    "flow": "org-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/repos",
        "name": "组织创建课程-非商家"
      },
      {
        "method": "POST",
        "path": "/external/classin/cloud/repository/detail",
        "name": "获取课程基本信息"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/exist",
        "name": "判断课程是否有可读权限并返回课程详情"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/admin/review",
        "name": "评审页-管理员给课程评分"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/admin/permissions",
        "name": "组织管理-获取管理员对课程的操作权限"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/admin/publish",
        "name": "管理员发布普通课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/admin/publish/cancel",
        "name": "超管取消发布课程"
      },
      {
        "method": "GET",
        "path": "/repositories/{id}",
        "name": "获取课程仓库详情"
      },
      {
        "method": "POST",
        "path": "/repos/batch/delete",
        "name": "组织管理-管理员批量删除课程"
      }
    ]
  },
  {
    "name": "口语卡相关",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/contents/{filepath}",
        "name": "获取课程lms内容"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/report",
        "name": "上报云盘最近打开的课程"
      },
      {
        "method": "POST",
        "path": "/repos/speaking/create",
        "name": "生成口语卡片读音、释义"
      },
      {
        "method": "POST",
        "path": "/repos/speaking/validate",
        "name": "口语卡-上传文件后端校验"
      },
      {
        "method": "POST",
        "path": "/repos/speaking/import",
        "name": "口语卡批量导入"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/lms",
        "name": "新建口语卡"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "在个人工作台搜索",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user/search/count",
        "name": "在个人工作台-搜索课程、文件数"
      },
      {
        "method": "GET",
        "path": "/user/repos",
        "name": "在个人工作台-搜索课程"
      },
      {
        "method": "GET",
        "path": "/user/files",
        "name": "在个人工作台-搜索文件-所有文件"
      },
      {
        "method": "GET",
        "path": "/user/files/count",
        "name": "在个人工作台-搜索文件分类"
      }
    ]
  },
  {
    "name": "在当前组织内-搜索流程",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/search/count",
        "name": "在组织工作台-搜索课程、文件、作者"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/repos",
        "name": "在组织工作台内-搜索课程"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/files",
        "name": "在组织工作台内-搜索文件(全部)"
      },
      {
        "method": "GET",
        "path": "/auth/orgs/{orgid}/files/count",
        "name": "在组织工作台内-搜索文件数量类型汇总"
      }
    ]
  },
  {
    "name": "转换eppt",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/valid/space",
        "name": "校验空间大小"
      },
      {
        "method": "GET",
        "path": "/file/cloud/list/{folderId}",
        "name": "获取云盘根目录文件A、文件夹B"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/cos/batch",
        "name": "上传云盘文件C、D到课程"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/contents",
        "name": "获取课程文件列表-ppt文件"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/preview",
        "name": "预览课程文件"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/eppt/transform",
        "name": "转换eppt"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/eppt/trans/query/{call_id}",
        "name": "查询eppt转换结果"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "修改组织背景图",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询背景图"
      },
      {
        "method": "POST",
        "path": "/orgs/{orgid}/background",
        "name": "修改组织背景图"
      }
    ]
  },
  {
    "name": "单接口汇总",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/system/time",
        "name": "获取系统时间"
      },
      {
        "method": "GET",
        "path": "/user/settings/notice",
        "name": "获取用户设置-通知设置信息"
      }
    ]
  },
  {
    "name": "协作页加载流程",
    "flow": "personal-course",
    "apis": [
      {
        "method": "GET",
        "path": "/gallery/{id}/category/images",
        "name": "查询课程封面"
      },
      {
        "method": "POST",
        "path": "/user/repos",
        "name": "创建个人课程"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/permissions",
        "name": "协作页-课程权限"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/cs",
        "name": "获取评分方案列表"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/contributors",
        "name": "协作页-共建列表"
      },
      {
        "method": "GET",
        "path": "/repos/{repoid}/pulls",
        "name": "收到的贡献列表"
      },
      {
        "method": "POST",
        "path": "/repos/{repoid}/delete",
        "name": "删除课程"
      }
    ]
  },
  {
    "name": "通知设置-修改",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user/settings/notice",
        "name": "获取用户设置-通知设置信息"
      },
      {
        "method": "POST",
        "path": "/user/settings/notice",
        "name": "场景_修改-通知设置"
      }
    ]
  },
  {
    "name": "获取用户id",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/user",
        "name": "获取用户id"
      }
    ]
  },
  {
    "name": "获取组织性质列表",
    "flow": "other",
    "apis": [
      {
        "method": "GET",
        "path": "/orgs/apply",
        "name": "获取组织性质列表"
      }
    ]
  },
  {
    "name": "申请组织",
    "flow": "other",
    "apis": [
      {
        "method": "POST",
        "path": "/orgs/apply",
        "name": "申请组织"
      }
    ]
  }
];
