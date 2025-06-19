/**
 * Writeathon MCP 服务
 * 基于Model Context Protocol实现的Writeathon API服务
 */
import express, { Request, Response } from "express";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { config } from "../config/env";
import { WriteathonApiClient } from "./api-client";

import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

export class WriteathonMCPService {
  private server: McpServer;
  private apiClient: WriteathonApiClient;
  private expressApp: express.Express;
  private transports: { [sessionId: string]: StreamableHTTPServerTransport } =
    {};
  private httpServer: any;

  constructor() {
    // 创建MCP服务器
    this.server = new McpServer({
      name: "Writeathon MCP",
      version: "1.0.0",
    });

    // 创建API客户端
    this.apiClient = new WriteathonApiClient();

    // 创建Express应用
    this.expressApp = express();
    this.expressApp.use(express.json());

    // 配置MCP资源和工具
    this.configureResources();
    this.configureTools();
    this.configurePrompts();

    // 配置SSE端点
    //this.configureSSEEndpoints();

    // 配置Streamable HTTP 端点
    this.configureStreamableHTTPEndpoints();
  }

  /**
   * 配置MCP资源
   */
  private configureResources(): void {
    // 用户信息资源
    this.server.resource("user", "user://me", async (uri) => {
      const response = await this.apiClient.getMe();
      if (!response.success || !response.data) {
        throw new Error("获取用户信息失败");
      }
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    });

    // 最近卡片列表资源
    this.server.resource(
      "recent-cards",
      new ResourceTemplate(
        "recent-cards://exclude_date_title={exclude_date_title}",
        {
          list: undefined,
        }
      ),
      async (uri, params) => {
        const excludeDateTitle = params.exclude_date_title === "true";

        const response = await this.apiClient.getRecentCards({
          exclude_date_title: excludeDateTitle,
        });
        if (!response.success || !response.data) {
          throw new Error("获取最近卡片列表失败");
        }
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }
    );

    // 卡片资源
    this.server.resource(
      "card",
      new ResourceTemplate("cards://{id}", { list: undefined }),
      async (uri, { id }) => {
        const response = await this.apiClient.getCard({
          id: Array.isArray(id) ? id[0] : id,
        });
        if (!response.success || !response.data) {
          throw new Error(`获取卡片失败: ${id}`);
        }
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }
    );

    // 写作拾贝资源
    this.server.resource(
      "writing-pick",
      new ResourceTemplate("writing-pick://{type}?limit={limit}", {
        list: undefined,
      }),
      async (uri, { type, limit }) => {
        const pickType = type || "all";
        const pickLimit = limit
          ? parseInt(Array.isArray(limit) ? limit[0] : limit, 10)
          : 10;
        const response = await this.apiClient.getWritingPick({
          type: pickType as "all" | "page" | "card",
          limit: pickLimit,
        });
        if (!response.success || !response.data) {
          throw new Error("获取写作拾贝失败");
        }
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }
    );
  }

  /**
   * 配置MCP工具
   */
  private configureTools(): void {
    // 创建卡片工具
    this.server.tool(
      "create-card",
      "创建卡片",
      {
        title: z.string().optional(),
        content: z.string().max(5000, "内容最大长度为5000个字符"),
      },
      async ({ title, content }) => {
        const response = await this.apiClient.createCard({ title, content });
        if (!response.success) {
          return {
            content: [
              { type: "text", text: `创建卡片失败: ${response.message}` },
            ],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: "卡片创建成功" }],
        };
      }
    );

    // 获取卡片工具
    this.server.tool(
      "get-card",
      "获取卡片",
      {
        title: z.string().optional(),
        id: z.string().optional(),
      },
      async ({ title, id }) => {
        if (!title && !id) {
          return {
            content: [{ type: "text", text: "请提供卡片标题或ID" }],
            isError: true,
          };
        }

        const response = await this.apiClient.getCard({ title, id });
        if (!response.success || !response.data) {
          return {
            content: [
              { type: "text", text: `获取卡片失败: ${response.message}` },
            ],
            isError: true,
          };
        }

        return {
          content: [
            { type: "text", text: JSON.stringify(response.data, null, 2) },
          ],
        };
      }
    );

    // 获取写作拾贝工具
    this.server.tool(
      "get-writing-pick",
      "写作拾贝",
      {
        type: z.enum(["all", "page", "card"]).optional(),
        limit: z.number().min(1).max(10).optional(),
      },
      async ({ type, limit }) => {
        const response = await this.apiClient.getWritingPick({
          type: type || "all",
          limit: limit || 10,
        });

        if (!response.success || !response.data) {
          return {
            content: [
              { type: "text", text: `获取写作拾贝失败: ${response.message}` },
            ],
            isError: true,
          };
        }

        return {
          content: [
            { type: "text", text: JSON.stringify(response.data, null, 2) },
          ],
        };
      }
    );
  }

  /**
   * 配置MCP提示
   */
  private configurePrompts(): void {
    // 卡片创建提示
    this.server.prompt(
      "create-card-prompt",
      "根据内容创建一张卡片",
      { content: z.string() },
      ({ content }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `请帮我创建一个卡片，内容如下：\n\n${content}`,
            },
          },
        ],
      })
    );

    // 写作拾贝提示
    this.server.prompt(
      "writing-pick-prompt",
      "获取写作拾贝",
      { type: z.enum(["all", "page", "card"]).optional() },
      ({ type }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `请为我提供${
                type ? type : "所有类型"
              }的写作拾贝，帮助我获取灵感。`,
            },
          },
        ],
      })
    );
  }

  // Reusable handler for GET and DELETE requests
  private handleSessionRequest = async (
    req: express.Request,
    res: express.Response
  ) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !this.transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    const transport = this.transports[sessionId];
    await transport.handleRequest(req, res);
  };

  /**
   * 配置Streamable HTTP 端点
   */
  private configureStreamableHTTPEndpoints(): void {
    // Handle POST requests for client-to-server communication
    this.expressApp.post("/mcp", async (req, res) => {
      // 验证Bearer Token
      const authHeader = req.headers.authorization;
      // const expectedToken = `Bearer ${config.mcp.apiKey}`;

      // if (!authHeader || authHeader !== expectedToken) {
      //   res.status(401).send("Unauthorized: Invalid API Key");
      //   return;
      // }
      // Check for existing session ID
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && this.transports[sessionId]) {
        // Reuse existing transport
        transport = this.transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            this.transports[sessionId] = transport;
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete this.transports[transport.sessionId];
          }
        };

        // ... set up server resources, tools, and prompts ...

        // Connect to the MCP server
        await this.server.connect(transport);
      } else {
        // Invalid request
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: No valid session ID provided",
          },
          id: null,
        });
        return;
      }

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    });

    // Handle GET requests for server-to-client notifications via SSE
    this.expressApp.get("/mcp", this.handleSessionRequest);

    // Handle DELETE requests for session termination
    this.expressApp.delete("/mcp", this.handleSessionRequest);

    // 健康检查端点
    this.expressApp.get("/mcp/health", (_, res) => {
      res.status(200).json({ status: "ok" });
    });
  }

  /**
   * 配置SSE端点
   */
  // private configureSSEEndpoints(): void {
  //   // SSE端点，用于建立服务器发送事件连接
  //   this.expressApp.get("/mcp/sse", async (req: Request, res: Response) => {
  //     // 验证Bearer Token
  //     const authHeader = req.headers.authorization;
  //     const expectedToken = `Bearer ${config.mcp.apiKey}`;

  //     if (!authHeader || authHeader !== expectedToken) {
  //       res.status(401).send("Unauthorized: Invalid API Key");
  //       return;
  //     }

  //     const transport = new SSEServerTransport("/mcp/messages", res);
  //     this.transports[transport.sessionId] = transport;
  //     res.on("close", () => {
  //       delete this.transports[transport.sessionId];
  //     });
  //     await this.server.connect(transport);
  //   });

  //   // 消息端点，用于接收客户端消息
  //   this.expressApp.post(
  //     "/mcp/messages",
  //     async (req: Request, res: Response) => {
  //       const sessionId = req.query.sessionId as string;
  //       const transport = this.transports[sessionId];

  //       if (transport) {
  //         // using `await transport.handlePostMessage(req, res)` will cause
  //         // `SSE transport error: Error: Error POSTing to endpoint (HTTP 400): InternalServerError: stream is not readable`
  //         // on the client side
  //         // https://medium.com/@itsuki.enjoy/mcp-server-and-client-with-sse-the-new-streamable-http-d860850d9d9d
  //         await transport.handlePostMessage(req, res, req.body);
  //       } else {
  //         res.status(400).send("No transport found for sessionId");
  //       }
  //     }
  //   );

  //   // 健康检查端点
  //   this.expressApp.get("/mcp/health", (_, res) => {
  //     res.status(200).json({ status: "ok" });
  //   });
  // }

  /**
   * 启动MCP服务
   */
  public start(): void {
    // 启动HTTP服务器
    const port = config.server.port + 1; // 使用不同的端口，避免与主服务冲突
    this.httpServer = this.expressApp.listen(port, () => {
      console.log(`MCP服务已启动: http://${config.server.host}:${port}`);
    });
  }

  /**
   * 停止MCP服务
   */
  public stop(): void {
    if (this.httpServer) {
      this.httpServer.close();
      console.log("MCP服务已停止");
    }
  }
}
