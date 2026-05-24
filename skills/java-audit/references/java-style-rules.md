# Java 代码风格规则（团队标准）

## 格式

| 规则 | 标准 |
|------|------|
| 缩进 | 4 空格，禁止 Tab |
| 大括号 | 左大括号不换行 (K&R) |
| 行宽 | 120 字符 |
| 文件编码 | UTF-8 |
| 换行符 | LF |
| 文件末尾 | 必须有空行 |
| 行尾空格 | 禁止 |

## 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 包名 | 全小写 | `com.example.user.service` |
| 类名 | 大驼峰 | `UserController` |
| 抽象类 | Abstract + 大驼峰 | `AbstractBaseService` |
| 接口 | 大驼峰（不加 I 前缀） | `UserService` |
| 方法名 | 小驼峰 | `getUserById` |
| 变量名 | 小驼峰 | `userName` |
| 常量 | 全大写下划线 | `MAX_RETRY_COUNT` |
| 枚举 | 全大写下划线 | `ORDER_STATUS` |
| 泛型 | 单个大写字母 | `T`, `E`, `K, V` |
| 日志变量 | 类名小驼驼 | `private static final Logger log` |

## Import 顺序

1. `java.*`
2. `javax.*`
3. 第三方库（`com.`, `org.`, `net.` 等）
4. 项目内部包

每组之间 1 空行。每组内按字母排序。

## 注释

- 公共类和公共方法必须有 Javadoc
- 复杂算法/业务逻辑必须有行内注释
- TODO 格式: `// TODO [author] description`
- 禁止注释掉的代码块（删除它，Git 会记住）

## 注解

- 类级注解: `@RestController` / `@Service` / `@Repository` / `@Configuration` 各占一行
- 方法级注解: `@Override` 单独一行，`@GetMapping` 等可同行
- `@RequestMapping` 与类注解之间无空行

## 方法

- 单个方法不超过 80 行
- 参数不超过 5 个，超过用 DTO 封装
- 返回值统一使用包装类 `Result<T>` / `R<T>`
- 空方法体也要有大括号

## 代码风格示例

```java
// ✅ 正确
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserVO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return UserConverter.toVO(user);
    }
}

// ❌ 错误
@Service @Transactional public class UserServiceImpl implements UserService{
private UserRepository userRepository;
// 缺少注释、缩进不一致、大括号风格混乱
}
```
